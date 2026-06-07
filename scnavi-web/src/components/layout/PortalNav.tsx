"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuthSession } from "@/lib/useAuthSession";
import { parse, differenceInMinutes } from "date-fns";

interface PortalNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function PortalNav({ collapsed, onToggle }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuthSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = profile?.role === "admin";
  const [viewMode, setViewMode] = useState<"student" | "admin">("student");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Sync viewMode with URL
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setViewMode("admin");
    } else {
      setViewMode("student");
    }
  }, [pathname]);

  // Live Clock Timer
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Background listener for live admin notifications and upcoming classes
  useEffect(() => {
    if (!user) return;

    // 1. Listen to admin announcements/notifications
    const q = query(collection(db, "notifications"), where("uid", "==", user.uid), where("read", "==", false));
    const unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (typeof window !== "undefined" && window.Notification && Notification.permission === "granted") {
            new Notification(data.title, { body: data.message });
          }
        }
      });
    });

    // 2. Class Reminder with date-fns for robust parsing
    const checkSchedule = async () => {
      try {
        const scheduleDoc = await getDoc(doc(db, "schedules", user.uid));
        if (!scheduleDoc.exists()) return;
        
        const entries = scheduleDoc.data().entries || [];
        const now = new Date();
        const currentDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
        
        entries.forEach((entry: any) => {
          if (!entry.days.includes(currentDay)) return;
          
          // Parse time using date-fns for robust 12-hour format handling
          const startTimeStr = entry.time.split("-")[0].trim();
          let classTime: Date;
          try {
            classTime = parse(startTimeStr.toUpperCase(), 'hh:mm a', now);
          } catch {
            return; // Skip if time format is unparseable
          }
          
          const diffMins = differenceInMinutes(classTime, now);
          
          // Upcoming: 30 minutes before class
          if (diffMins > 0 && diffMins <= 30) {
            const cacheKey = `alert_upcoming_${user.uid}_${entry.code}_${now.toDateString()}`;
            if (!localStorage.getItem(cacheKey)) {
              localStorage.setItem(cacheKey, "true");
              if (typeof window !== "undefined" && window.Notification && Notification.permission === "granted") {
                new Notification(`Upcoming Class: ${entry.subject}`, { 
                  body: `Starts in ${diffMins} minutes at ${entry.room}`,
                  icon: "/icon-192x192.png"
                });
              }
            }
          }

          // Ongoing: class has just started (within first 2 minutes)
          if (diffMins <= 0 && diffMins >= -2) {
            const cacheKey = `alert_ongoing_${user.uid}_${entry.code}_${now.toDateString()}`;
            if (!localStorage.getItem(cacheKey)) {
              localStorage.setItem(cacheKey, "true");
              if (typeof window !== "undefined" && window.Notification && Notification.permission === "granted") {
                new Notification(`Class Started: ${entry.subject}`, { 
                  body: `Now ongoing at ${entry.room}`,
                  icon: "/icon-192x192.png"
                });
              }
            }
          }
        });
      } catch (e) {
        console.error("Schedule alert error", e);
      }
    };

    // Ask for native notification permission
    if (typeof window !== "undefined" && window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const intervalId = setInterval(checkSchedule, 60000); // check every minute
    checkSchedule(); // initial check

    return () => {
      unsubscribeNotifications();
      clearInterval(intervalId);
    };
  }, [user]);

  const studentNavItems = [
    { name: "Home",     href: "/dashboard", icon: "home" },
    { name: "Map",      href: "/map",        icon: "map" },
    { name: "Schedule", href: "/schedule",   icon: "calendar_today" },
    { name: "Events",   href: "/events",     icon: "event" },
    { name: "Feedback", href: "/feedback",   icon: "rate_review" },
    { name: "Profile",  href: "/profile",    icon: "person" },
  ];

  const adminNavItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { name: "Conflicts", href: "/admin/conflicts", icon: "warning" },
    { name: "Rooms",     href: "/admin/rooms",     icon: "meeting_room" },
    { name: "Floorplan", href: "/admin/floorplan", icon: "architecture" },
    { name: "Schedules", href: "/admin/schedules", icon: "calendar_month" },
    { name: "Events",    href: "/admin/events",    icon: "event" },
    { name: "Feedback",  href: "/admin/feedback",  icon: "rate_review" },
    { name: "Notifications", href: "/admin/notifications", icon: "notifications" },
    { name: "Users",     href: "/admin/users",     icon: "manage_accounts" },
  ];

  const navItems = isAdmin && viewMode === "admin" ? adminNavItems : studentNavItems;

  // Get user initials for profile avatar
  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col bg-surface-container-lowest border-r border-outline-variant/30 h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        {/* Logo + collapse toggle + profile */}
        <div className={`flex items-center border-b border-outline-variant/30 h-16 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined ms-fill text-primary text-[26px] shrink-0">explore</span>
              <span className="font-headline font-bold text-on-surface text-[20px] leading-none whitespace-nowrap">SCNavi</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined ms-fill text-primary text-[26px]">explore</span>
            </Link>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                onClick={onToggle}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shrink-0"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">chevron_left</span>
              </button>
            </div>
          )}
          {collapsed && (
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors shrink-0 mt-2"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">chevron_right</span>
            </button>
          )}
        </div>

        {/* View Mode Toggle for Admins */}
        {isAdmin && !collapsed && (
          <div className="mx-3 mt-3 mb-1 flex bg-surface-container rounded-xl p-1 shrink-0">
            <button
              onClick={() => {
                setViewMode("student");
                router.push("/dashboard");
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "student" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => {
                setViewMode("admin");
                router.push("/admin/dashboard");
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "admin" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Admin
            </button>
          </div>
        )}
        {isAdmin && collapsed && (
          <div className="mx-3 mt-3 mb-1 flex flex-col gap-1 shrink-0">
             <button
              onClick={() => {
                setViewMode("student");
                router.push("/dashboard");
              }}
              className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "student" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface bg-surface-container"
              }`}
              title="Faculty View"
            >
              F
            </button>
            <button
              onClick={() => {
                setViewMode("admin");
                router.push("/admin/dashboard");
              }}
              className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "admin" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface bg-surface-container"
              }`}
              title="Admin View"
            >
              A
            </button>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden" aria-label="Sidebar navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                } ${collapsed ? "justify-center" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`material-symbols-outlined text-[22px] shrink-0 ${isActive ? "ms-fill" : ""}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Live Clock Widget */}
        {currentTime && !collapsed && (
          <div className="mx-3 mb-4 p-3 rounded-2xl bg-surface-container/50 border border-outline-variant/30 flex flex-col items-center justify-center text-center animate-fade shadow-inner">
            <p className="text-xl font-headline font-bold text-primary tracking-tight">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-outline uppercase tracking-[0.15em] mt-1">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        )}
        {currentTime && collapsed && (
          <div className="mx-2 mb-4 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/30 flex flex-col items-center justify-center text-center animate-fade">
            <span className="material-symbols-outlined text-[20px] text-primary mb-1">schedule</span>
            <p className="text-[10px] font-bold text-primary">
              {currentTime.getHours().toString().padStart(2, '0')}
            </p>
            <p className="text-[10px] font-bold text-primary">
              {currentTime.getMinutes().toString().padStart(2, '0')}
            </p>
          </div>
        )}
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/30 flex items-center h-16 px-1" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${isActive ? "text-primary" : "text-inactive"}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? "ms-fill" : ""}`}>
                {item.icon}
              </span>
              <span className="text-xs font-medium mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
