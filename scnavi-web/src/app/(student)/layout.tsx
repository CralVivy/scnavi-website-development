"use client";
import React, { useState, useEffect, useRef } from "react";
import { StudentNav } from "@/components/layout/StudentNav";
import { useAuthSession } from "@/lib/useAuthSession";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { parse, differenceInMinutes } from "date-fns";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, profile, loading } = useAuthSession();
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nextClass, setNextClass] = useState<any | null>(null);

  // Redirect to login if unauthenticated (after initial load)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Notifications snapshot
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      // Sort in-memory to avoid needing index creation on user.uid + read + createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(list);
    });

    return () => unsubscribe();
  }, [user]);

  // Compute Next Class
  useEffect(() => {
    if (!user) return;

    const getNextClass = async () => {
      try {
        const scheduleDoc = await getDoc(doc(db, "schedules", user.uid));
        if (!scheduleDoc.exists()) return;
        
        const entries = scheduleDoc.data().entries || [];
        const now = new Date();
        const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
        
        let closest: any = null;
        let minDiff = Infinity;
        
        entries.forEach((entry: any) => {
          if (!entry.days.includes(currentDay)) return;
          
          const startTimeStr = entry.time.split("-")[0].trim();
          let classTime: Date;
          try {
            classTime = parse(startTimeStr.toUpperCase(), 'hh:mm a', now);
          } catch {
            return;
          }
          
          const diff = differenceInMinutes(classTime, now);
          if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            closest = entry;
          }
        });
        
        setNextClass(closest);
      } catch (err) {
        console.error("Error reading schedule for top bar", err);
      }
    };

    getNextClass();
    const interval = setInterval(getNextClass, 60000); // refresh every min
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const promises = notifications.map((n) => updateDoc(doc(db, "notifications", n.id), { read: true }));
      await Promise.all(promises);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined ms-fill text-primary text-[48px] animate-pulse">explore</span>
          <p className="text-sm text-outline font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : (user.displayName || "Student");
  const course = profile?.course || "Bicol University";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-surface dark:bg-surface">
      <StudentNav collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main className="flex-1 flex flex-col pb-16 md:pb-0 min-h-screen overflow-y-auto">
        {/* Dropdown Backdrop */}
        {notifOpen && (
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setNotifOpen(false)}
          />
        )}

        {/* ── Mobile Top Bar ── */}
        <header className="md:hidden bg-white dark:bg-surface-container-lowest border-b border-outline-variant/30 flex items-center px-4 h-14 sticky top-0 z-40">
          <div className="flex-1 flex items-center gap-2">
            <span className="material-symbols-outlined ms-fill text-primary text-[22px]">explore</span>
            <span className="font-headline font-bold text-on-surface text-[18px]">SCNavi</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[24px]">notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-room-red rounded-full flex items-center justify-center text-[9px] text-white font-bold border-2 border-white">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
            
            <Link href="/profile" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </Link>
          </div>
        </header>

        {/* ── Desktop Top Bar ── */}
        <header className="hidden md:flex bg-white/90 dark:bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-6 py-0 h-16 items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-[17px] text-on-surface">Student Portal</h2>
          </div>
          <div className="flex items-center gap-3 relative">
            {/* Notification bell */}
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">notifications</span>
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-room-red rounded-full border-2 border-white" />
              )}
            </button>

            {/* Dropdown Card */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade flex flex-col max-h-[450px]">
                <div className="p-4 border-b border-outline-variant/20 bg-surface-container/20 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-sm text-on-surface">Notifications</h3>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
                  {/* Pinned next class */}
                  {nextClass && (
                    <div className="p-3.5 bg-primary/5 border-b border-primary/10">
                      <div className="flex gap-2 items-center text-primary text-xs font-bold uppercase tracking-wider mb-1">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        Upcoming Class
                      </div>
                      <p className="font-bold text-sm text-on-surface">{nextClass.subject}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-outline font-medium">
                        <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">schedule</span>{nextClass.time}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[14px]">meeting_room</span>{nextClass.room}</span>
                      </div>
                    </div>
                  )}

                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-outline">
                      <span className="material-symbols-outlined text-[32px] text-outline-variant mb-1.5">notifications_off</span>
                      <p className="text-xs font-medium">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-3.5 hover:bg-surface-container/30 transition-colors cursor-pointer text-left"
                      >
                        <p className="font-bold text-xs text-on-surface">{notif.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-outline mt-1.5 block">
                          {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* User pill */}
            <Link 
              href="/profile"
              className="flex items-center gap-2.5 bg-surface-container hover:bg-surface-container-high transition-colors rounded-full pl-1 pr-4 py-1 cursor-pointer border border-outline-variant/20"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="hidden lg:block leading-tight text-left">
                <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                <p className="text-xs text-outline font-medium">{course}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page Content (wider max-width for Dribbble-style use of space) ── */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
