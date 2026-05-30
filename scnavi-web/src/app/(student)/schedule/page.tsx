"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { useAuthSession } from "@/lib/useAuthSession";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { getColorForSubject } from "@/lib/scheduleColors";

interface ScheduleEntry {
  subject: string;
  code: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage() {
  const { user } = useAuthSession();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [parsing, setParsing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filename, setFilename] = useState("");
  const [view, setView] = useState<"daily" | "overview" | "grid">("daily");
  const [errorMsg, setErrorMsg] = useState("");
  const [currentDayName, setCurrentDayName] = useState("");

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    setCurrentDayName(days[new Date().getDay()]);
  }, []);

  // Load saved schedule from Firestore on mount
  useEffect(() => {
    if (!user) return;
    const loadSchedule = async () => {
      try {
        const scheduleDoc = await getDoc(doc(db, "schedules", user.uid));
        if (scheduleDoc.exists()) {
          const data = scheduleDoc.data();
          if (data.entries && Array.isArray(data.entries)) {
            setSchedule(data.entries);
            setSaved(true);
          }
        }
      } catch (err) {
        console.error("Failed to load saved schedule:", err);
      }
    };
    loadSchedule();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    setParsing(true);
    setSaved(false);
    setErrorMsg("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Authentication required");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-cor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse schedule");
      }

      if (data.entries && Array.isArray(data.entries)) {
        setSchedule(data.entries);
      } else {
        throw new Error("Invalid format received from AI");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setSchedule([]);
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!user || schedule.length === 0) return;
    try {
      await setDoc(doc(db, "schedules", user.uid), {
        uid: user.uid,
        entries: schedule,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (err) {
      console.error("Schedule save error:", err);
    }
  };

  const parseTime = (t: string) => {
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1], 10);
    if (h === 12 && match[3].toUpperCase() === 'AM') h = 0;
    if (h !== 12 && match[3].toUpperCase() === 'PM') h += 12;
    return h * 60 + parseInt(match[2], 10);
  };

  // ── Tab 1: Daily filter ──
  const todayEntries = schedule
    .filter((e) => e.days.includes(currentDayName))
    .sort((a, b) => {
      const startA = a.time.split("-")[0].trim();
      const startB = b.time.split("-")[0].trim();
      return parseTime(startA) - parseTime(startB);
    });

  // ── Tab 2: Overview Grouped by Subject ──
  const groupedOverview: Record<string, ScheduleEntry[]> = {};
  schedule.forEach((entry) => {
    if (!groupedOverview[entry.subject]) {
      groupedOverview[entry.subject] = [];
    }
    groupedOverview[entry.subject].push(entry);
  });

  // ── Tab 3: Weekly Grid helpers ──
  const uniqueTimeSlots = Array.from(
    new Set(schedule.map(s => s.time.split('-')[0].trim().replace('–', '').trim()))
  ).sort((a, b) => parseTime(a) - parseTime(b));

  const gridTimeSlots = uniqueTimeSlots.length > 0 ? uniqueTimeSlots : ["08:00 AM", "09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM"];
  const activeDays = ALL_DAYS.filter(day => schedule.some(s => s.days.includes(day)));
  const gridDays = activeDays.length > 0 ? activeDays : ALL_DAYS.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade">
      <div>
        <h2 className="font-headline font-semibold text-3xl md:text-4xl tracking-tight text-on-surface">My Schedule</h2>
        <p className="text-base text-outline mt-1">Upload your Certificate of Registration (COR) to auto-populate your schedule.</p>
      </div>

      {/* Upload Card */}
      <Card className="border border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">upload_file</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-on-surface">Upload your COR</p>
            <p className="text-sm text-outline mt-0.5">Supports PDF or image files. Our AI will extract your schedule automatically.</p>
            {filename && <p className="text-xs text-primary font-medium mt-1">📎 {filename}</p>}
          </div>
          <label className="cursor-pointer shrink-0">
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleFileUpload} disabled={parsing} />
            <div className={`inline-flex items-center gap-2 h-10 px-5 rounded-xl font-bold text-sm transition-all ${parsing ? "bg-surface-container text-outline cursor-wait" : "bg-primary text-white shadow-md hover:opacity-90 active:scale-95"}`}>
              {parsing ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Parsing COR...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  {schedule.length > 0 ? "Re-upload" : "Choose File"}
                </>
              )}
            </div>
          </label>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMsg}
          </div>
        )}

        {/* AI Status banner */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-surface-container/60 rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
          <p className="text-xs text-on-surface-variant">
            <strong>AI Powered:</strong> Using Gemini 2.5 Flash to securely extract your schedule.
          </p>
        </div>
      </Card>

      {/* Parsed Schedule */}
      {schedule.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-semibold text-xl text-on-surface">Extracted Schedule</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex bg-surface-container rounded-xl p-1 gap-1">
                {(["daily", "overview", "grid"] as const).map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setView(v)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize flex items-center gap-1.5 ${view === v ? "bg-white shadow text-on-surface" : "text-outline hover:text-on-surface"}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {v === "daily" ? "today" : v === "overview" ? "menu_book" : "calendar_view_week"}
                    </span>
                    {v}
                  </button>
                ))}
              </div>
              <Button onClick={handleSave} disabled={saved} size="sm">
                {saved ? "✓ Saved" : "Save to My Account"}
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          {view === "daily" && (
            <div className="space-y-4">
              <div className="bg-surface-container/40 p-3 rounded-xl border border-outline-variant/20 text-xs font-medium text-outline flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">event</span>
                Showing schedule for today: <strong>{currentDayName === "Sun" ? "Sunday (No classes)" : currentDayName}</strong>
              </div>
              {todayEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container/10">
                  <span className="material-symbols-outlined text-[48px] text-outline-variant">relax</span>
                  <p className="font-semibold text-on-surface mt-2">No classes scheduled for today</p>
                  <p className="text-xs text-outline mt-0.5">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayEntries.map((entry, i) => {
                    const color = getColorForSubject(entry.subject);
                    return (
                      <Card key={i} className={`flex gap-4 items-start border ${color.border} hover:shadow-md transition-all relative overflow-hidden`}>
                        <div className={`w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
                          <span className={`material-symbols-outlined ms-fill ${color.text} text-[24px]`}>school</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{entry.subject}</p>
                          <p className={`text-xs ${color.text} font-semibold mt-0.5`}>{entry.code}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full whitespace-nowrap">
                              <span className="material-symbols-outlined text-[13px]">schedule</span>{entry.time}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">meeting_room</span>{entry.room}
                            </span>
                          </div>
                          <p className="text-xs text-outline mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">person</span>
                            {entry.instructor}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(groupedOverview).map((subjName, i) => {
                const entries = groupedOverview[subjName];
                const code = entries[0]?.code || "Subject Code";
                const color = getColorForSubject(subjName);
                return (
                  <Card key={i} className={`border ${color.border} flex flex-col gap-3 hover:shadow-md transition-all`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined ms-fill ${color.text} text-[20px]`}>menu_book</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface truncate">{subjName}</p>
                        <p className={`text-xs ${color.text} font-semibold`}>{code}</p>
                      </div>
                    </div>

                    <div className="border-t border-outline-variant/10 pt-2 space-y-2">
                      {entries.map((entry, idx) => (
                        <div key={idx} className="flex flex-col gap-1 text-xs text-on-surface-variant bg-surface-container/30 p-2 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-on-surface flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {entry.days}
                            </span>
                            <span className="text-[11px] text-outline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {entry.time}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-outline">
                            <span className="truncate flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">person</span>
                              {entry.instructor}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                              {entry.room}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {view === "grid" && (
            /* Weekly grid view */
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
              <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '140px', minWidth: '140px' }} />
                  {gridDays.map((d) => (
                    <col key={d} style={{ width: `${100 / gridDays.length}%`, minWidth: '140px' }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="bg-surface-container">
                    <th className="px-4 py-3 text-left text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20">Time</th>
                    {gridDays.map((d) => (
                      <th key={d} className="px-4 py-3 text-center text-xs font-bold text-outline uppercase tracking-wider border-b border-outline-variant/20">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridTimeSlots.map((timeSlot) => (
                    <tr key={timeSlot} className="border-b border-outline-variant/10 hover:bg-surface-container/50">
                      <td className="px-4 py-3 text-xs font-mono text-outline font-medium whitespace-nowrap">{timeSlot}</td>
                      {gridDays.map((day) => {
                        const entry = schedule.find((s) =>
                          s.days.includes(day) &&
                          s.time.startsWith(timeSlot)
                        );
                        const color = entry ? getColorForSubject(entry.subject) : null;
                        return (
                          <td key={day} className="px-2 py-2">
                            {entry && color ? (
                              <div className={`${color.bg} border ${color.border} rounded-lg px-2 py-1.5 text-left`}>
                                <p className={`text-xs font-bold ${color.text} leading-tight truncate`}>{entry.subject}</p>
                                <p className="text-[10px] text-outline mt-0.5 whitespace-nowrap">{entry.time}</p>
                                <p className="text-[10px] text-outline">{entry.room}</p>
                                <p className="text-[10px] text-outline truncate">{entry.instructor}</p>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {schedule.length === 0 && !parsing && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">calendar_today</span>
          <p className="font-semibold text-on-surface mt-3">No schedule yet</p>
          <p className="text-sm text-outline mt-1">Upload your COR above to get started.</p>
        </div>
      )}
    </div>
  );
}
