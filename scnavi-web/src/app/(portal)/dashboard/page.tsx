"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { CampusMap } from "@/components/map/CampusMap";
import { useAuthSession } from "@/lib/useAuthSession";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { getColorForSubject } from "@/lib/scheduleColors";
import { parse, differenceInMinutes, isWithinInterval } from "date-fns";

interface ScheduleEntry {
  subject: string;
  code: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
}

/** Parse a time string like "08:30 AM" into a Date object for today */
function parseTimeToday(timeStr: string): Date | null {
  try {
    const cleaned = timeStr.trim().toUpperCase();
    return parse(cleaned, 'hh:mm a', new Date());
  } catch {
    return null;
  }
}


export default function StudentDashboardPage() {
  const { user, profile, loading } = useAuthSession();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [dismissedAdvisories, setDismissedAdvisories] = useState<string[]>([]);

  // Listen for unread advisories targeted to the current student
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid),
      where("type", "==", "advisory"),
      where("read", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAdvisories(list);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDismissAdvisory = (id: string) => {
    setDismissedAdvisories((prev) => [...prev, id]);
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dayStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const currentDayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];

  const displayName = loading
    ? "..."
    : profile ? profile.firstName : "Student";

  // Load schedule from Firestore
  useEffect(() => {
    if (!user) return;
    const loadSchedule = async () => {
      try {
        const scheduleDoc = await getDoc(doc(db, "schedules", user.uid));
        if (scheduleDoc.exists()) {
          const data = scheduleDoc.data();
          if (data.entries && Array.isArray(data.entries)) {
            setSchedule(data.entries);
          }
        }
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setScheduleLoading(false);
      }
    };
    loadSchedule();
  }, [user]);

  // Filter today's classes and sort by start time
  const todayClasses = schedule
    .filter(entry => entry.days.includes(currentDayAbbr))
    .sort((a, b) => {
      const aTime = parseTimeToday(a.time.split('-')[0].trim());
      const bTime = parseTimeToday(b.time.split('-')[0].trim());
      return (aTime?.getTime() || 0) - (bTime?.getTime() || 0);
    });

  // Determine the status of each class
  const getClassStatus = (entry: ScheduleEntry): "active" | "upcoming" | "done" => {
    const parts = entry.time.split('-');
    if (parts.length < 2) return "done";
    const startTime = parseTimeToday(parts[0].trim());
    const endTime = parseTimeToday(parts[1].trim());
    if (!startTime || !endTime) return "done";

    if (isWithinInterval(now, { start: startTime, end: endTime })) {
      return "active";
    }
    if (differenceInMinutes(startTime, now) > 0) {
      return "upcoming";
    }
    return "done";
  };

  // Find next upcoming or currently active class
  const nextClass = todayClasses.find(c => {
    const status = getClassStatus(c);
    return status === "active" || status === "upcoming";
  });

  const getNextClassLabel = () => {
    if (!nextClass) return null;
    const status = getClassStatus(nextClass);
    const parts = nextClass.time.split('-');
    const startTime = parseTimeToday(parts[0]?.trim() || "");
    if (status === "active") {
      return { label: "Ongoing Now", className: "bg-room-green/10 text-room-green border-room-green/20" };
    }
    if (startTime) {
      const mins = differenceInMinutes(startTime, now);
      if (mins <= 30 && mins > 0) {
        return { label: `Starts in ${mins} min`, className: "bg-amber-100 text-amber-700 border-amber-200" };
      }
      return { label: `Starts at ${parts[0]?.trim()}`, className: "bg-primary/10 text-primary border-primary/20" };
    }
    return null;
  };

  const nextClassInfo = getNextClassLabel();
  const nextClassColor = nextClass ? getColorForSubject(nextClass.subject) : null;

  return (
    <div className="space-y-6 animate-fade">
      {/* Greeting */}
      <div>
        <h2 className="font-headline font-semibold text-3xl md:text-4xl tracking-tight text-on-surface leading-tight">
          {greeting}, {displayName}
        </h2>
        <p className="font-sans text-base text-outline mt-1">{dayStr}</p>
      </div>

      {/* Campus Advisories */}
      {advisories.filter((adv) => !dismissedAdvisories.includes(adv.id)).length > 0 && (
        <div className="space-y-3">
          {advisories
            .filter((adv) => !dismissedAdvisories.includes(adv.id))
            .map((adv) => (
            <div 
              key={adv.id} 
              className="relative p-3 bg-orange-100 border border-orange-200 rounded-xl inline-flex items-start gap-3 text-orange-900 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300 animate-fade w-fit max-w-full"
            >
              <span className="material-symbols-outlined text-orange-900 dark:text-orange-300 mt-0.5 text-[20px]">warning</span>
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-bold text-sm text-orange-900 dark:text-orange-300">{adv.title}</h4>
                <p className="text-xs mt-0.5 text-orange-900 dark:text-orange-300 opacity-90 leading-relaxed whitespace-pre-wrap">{adv.message}</p>
                <span className="text-[10px] text-orange-900 dark:text-orange-300 opacity-75 mt-1 block">
                  {new Date(adv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <button 
                onClick={() => handleDismissAdvisory(adv.id)}
                className="text-orange-900 dark:text-orange-300 opacity-60 hover:opacity-100 transition-opacity p-0.5 ml-2 shrink-0"
                title="Dismiss Advisory"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}


      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Schedule */}
        <div className="xl:col-span-2 space-y-6">

          {/* Next Class */}
          {nextClass && nextClassColor ? (
            <Card className={`flex items-start gap-5 bg-gradient-to-br ${nextClassColor.gradientLight} ${nextClassColor.gradientDark} border ${nextClassColor.border} ${nextClassColor.darkBorder} shadow-lg`}>
              <div className={`shrink-0 w-14 h-14 rounded-2xl ${nextClassColor.bg} ${nextClassColor.darkBg} shadow-sm border ${nextClassColor.border} ${nextClassColor.darkBorder} flex items-center justify-center mt-1`}>
                <span className={`material-symbols-outlined ms-fill ${nextClassColor.text} ${nextClassColor.darkText} text-[30px]`}>schedule</span>
              </div>
              <div className="flex-grow">
                <span className={`block text-xs ${nextClassColor.text} ${nextClassColor.darkText} uppercase tracking-wider font-bold mb-1`}>Next Class</span>
                <h3 className="font-bold text-2xl text-on-surface leading-tight mb-1">{nextClass.subject}</h3>
                <p className="text-[15px] text-on-surface-variant font-medium">{nextClass.room} · {nextClass.time}</p>
                <p className="text-sm text-outline mt-0.5">{nextClass.instructor}</p>
                <div className="flex items-center gap-3 mt-4">
                  {nextClassInfo && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${nextClassInfo.className}`}>
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span className="text-sm font-semibold">{nextClassInfo.label}</span>
                    </div>
                  )}
                  <a href="/map" className="text-sm font-bold text-primary hover:underline">View on Map →</a>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex items-start gap-5 bg-gradient-to-br from-surface-container-lowest to-primary/5 dark:from-surface-container dark:to-primary/10 border border-primary/10 shadow-lg">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-high shadow-sm border border-outline-variant/20 flex items-center justify-center mt-1">
                <span className="material-symbols-outlined ms-fill text-primary text-[30px]">schedule</span>
              </div>
              <div className="flex-grow">
                <span className="block text-xs text-primary uppercase tracking-wider font-bold mb-1">Next Class</span>
                <h3 className="font-bold text-2xl text-on-surface leading-tight mb-1">
                  {scheduleLoading ? "Loading..." : "No more classes today"}
                </h3>
                <p className="text-[15px] text-on-surface-variant font-medium">
                  {scheduleLoading ? "" : "You're all done for the day!"}
                </p>
              </div>
            </Card>
          )}

          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xl text-on-surface">Today's Schedule</h3>
              <a href="/schedule" className="text-sm font-bold text-primary hover:underline">View full →</a>
            </div>
            {todayClasses.length > 0 ? (
              <div className="space-y-0 pl-2">
                {todayClasses.map((item, i, arr) => {
                  const status = getClassStatus(item);
                  const color = getColorForSubject(item.subject);
                  const startTimeStr = item.time.split('-')[0]?.trim() || "";
                  return (
                    <div key={i} className="flex gap-6">
                      <div className="w-14 shrink-0 pt-4 text-right">
                        <span className="text-sm text-outline font-mono font-medium whitespace-nowrap">{startTimeStr}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        {i > 0 && <div className={`w-0.5 h-4 ${getClassStatus(arr[i-1]) === "active" ? "bg-room-green/40" : "bg-primary/20"}`} />}
                        {i === 0 && <div className="h-4" />}
                        <div className={`w-3.5 h-3.5 rounded-full z-10 ${status === "active" ? "bg-room-green ring-4 ring-room-green/20" : status === "done" ? "bg-outline-variant" : `${color.bgAccent}`}`} />
                        {i < arr.length - 1 && <div className={`w-0.5 flex-grow mt-2 ${status === "active" ? "bg-room-green/30" : "bg-primary/20"}`} />}
                      </div>
                      <div className="flex-grow pb-8">
                        <Card className={`!p-4 border ${color.border} ${color.darkBorder} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-full min-h-[40px] rounded-full ${color.bgAccent} shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[16px] text-on-surface">{item.subject}</p>
                              <p className="text-sm text-outline font-medium mt-0.5">{item.room} · {item.time}</p>
                              <p className="text-xs text-outline mt-0.5">{item.instructor}</p>
                            </div>
                            {status === "active" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-room-green/10 text-room-green border border-room-green/20 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-room-green animate-pulse" />
                                LIVE
                              </span>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">event_busy</span>
                <p className="text-sm text-outline mt-2">
                  {scheduleLoading ? "Loading schedule..." : "No classes scheduled for today."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Map + Quick Links */}
        <div className="space-y-6">
          <Card className="!p-0 overflow-hidden border border-outline-variant/20 flex flex-col">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-lowest">
              <h3 className="font-semibold text-base text-on-surface">Campus Map</h3>
              <a href="/map" className="text-xs font-bold text-primary hover:underline">Full Map →</a>
            </div>
            <div className="h-64 bg-surface-container-low relative">
              <CampusMap />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-base text-on-surface mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/feedback"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group border border-transparent hover:border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">rate_review</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Submit Feedback</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
              </a>
 
              <a
                href="/schedule"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group border border-transparent hover:border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">My Schedule</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
              </a>
 
              <a
                href="/events"
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group border border-transparent hover:border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">event</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Campus Events</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
              </a>
            </div>
          </Card>
        </div>
      </div>


    </div>
  );
}
