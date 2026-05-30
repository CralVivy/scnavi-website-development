"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { CampusMap } from "@/components/map/CampusMap";
import { useAuthSession } from "@/lib/useAuthSession";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
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

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuthSession();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, "feedback"), {
        uid: user.uid,
        name: profile ? `${profile.firstName} ${profile.lastName}` : "Student",
        email: user.email,
        rating,
        message: text.trim(),
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setSent(true);
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="font-semibold text-base text-on-surface">Submit Feedback</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[20px] text-outline">close</span>
          </button>
        </div>
        {sent ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined ms-fill text-room-green text-[48px]">check_circle</span>
            <p className="font-semibold text-on-surface">Thank you for your feedback!</p>
            <p className="text-sm text-outline">Your response has been submitted to the admin team.</p>
            <Button onClick={onClose} className="mt-2">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setRating(s)}>
                    <span className={`material-symbols-outlined text-[28px] transition-colors ${s <= rating ? "text-accent ms-fill" : "text-outline-variant"}`}>star</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Your Feedback</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                required
                placeholder="Tell us how we can improve SCNavi..."
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface placeholder:text-outline resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <Button type="submit" disabled={sending || !text.trim()} className="w-full">
              {sending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user, profile, loading } = useAuthSession();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

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
          {greeting}, {displayName} 👋
        </h2>
        <p className="font-sans text-base text-outline mt-1">{dayStr}</p>
      </div>

      {/* Campus Alert Banner */}
      <div className="bg-[#FFF9F0] dark:bg-accent/10 border border-[#FFE4B0] dark:border-accent/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-accent text-[22px]">campaign</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#5D3A00] dark:text-accent font-bold leading-snug">Advisory: No classes 4:00 PM onwards today</p>
          <p className="text-xs text-[#5D3A00]/70 dark:text-accent/60 mt-0.5">University wide mandate.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Schedule */}
        <div className="xl:col-span-2 space-y-6">

          {/* Next Class */}
          {nextClass && nextClassColor ? (
            <Card className={`flex items-start gap-5 bg-gradient-to-br from-white to-${nextClassColor.bg.replace('bg-', '')}/30 dark:from-surface-container dark:to-${nextClassColor.bg.replace('bg-', '')}/20 border ${nextClassColor.border} shadow-lg`}>
              <div className={`shrink-0 w-14 h-14 rounded-2xl ${nextClassColor.bg} shadow-sm border ${nextClassColor.border} flex items-center justify-center mt-1`}>
                <span className={`material-symbols-outlined ms-fill ${nextClassColor.text} text-[30px]`}>schedule</span>
              </div>
              <div className="flex-grow">
                <span className={`block text-xs ${nextClassColor.text} uppercase tracking-wider font-bold mb-1`}>Next Class</span>
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
                        <Card className={`!p-4 border ${color.border} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
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
              <button
                onClick={() => setFeedbackOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group border border-transparent hover:border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">rate_review</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Submit Feedback</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
 
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

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}
