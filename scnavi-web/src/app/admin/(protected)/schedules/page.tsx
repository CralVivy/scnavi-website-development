"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { getColorForSubject } from "@/lib/scheduleColors";

interface ScheduleEntry {
  subject: string;
  code: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
}

interface UserSchedule {
  uid: string;
  course: string;
  name: string;
  entries: ScheduleEntry[];
}

export default function AdminSchedulesPage() {
  const [schedulesByCourse, setSchedulesByCourse] = useState<Record<string, UserSchedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users to map UID to course/name
        const usersSnap = await getDocs(collection(db, "users"));
        const userMap = new Map<string, { course: string; name: string }>();
        usersSnap.forEach((doc) => {
          const data = doc.data();
          userMap.set(doc.id, {
            course: data.course || "Unassigned",
            name: `${data.firstName} ${data.lastName}`.trim() || "Unknown Student",
          });
        });

        // Fetch all schedules
        const schedulesSnap = await getDocs(collection(db, "schedules"));
        const grouped: Record<string, UserSchedule[]> = {};

        schedulesSnap.forEach((doc) => {
          const data = doc.data();
          const userInfo = userMap.get(doc.id) || { course: "Unassigned", name: "Unknown Student" };
          
          if (!grouped[userInfo.course]) {
            grouped[userInfo.course] = [];
          }
          grouped[userInfo.course].push({
            uid: doc.id,
            course: userInfo.course,
            name: userInfo.name,
            entries: data.entries || [],
          });
        });

        setSchedulesByCourse(grouped);
      } catch (err) {
        console.error("Failed to load schedules", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">calendar_month</span>
      </div>
    );
  }

  const courseKeys = Object.keys(schedulesByCourse).sort();

  return (
    <div className="space-y-6 animate-fade">
      <div>
        <h2 className="font-headline font-semibold text-2xl text-on-surface">Class Schedules</h2>
        <p className="text-sm text-outline mt-0.5">View and monitor all student schedules grouped by section/course.</p>
      </div>

      {courseKeys.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant/40">
          <span className="material-symbols-outlined text-[56px] text-outline-variant">event_busy</span>
          <p className="font-semibold text-on-surface mt-3">No schedules found</p>
          <p className="text-sm text-outline mt-1">Students need to upload their COR to generate schedules.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {courseKeys.map((course) => (
            <Card key={course} className="p-0 overflow-hidden border border-outline-variant/30">
              <button 
                onClick={() => setExpandedCourse(expandedCourse === course ? null : course)}
                className="w-full flex items-center justify-between p-4 bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">groups</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-on-surface text-base">{course}</h3>
                    <p className="text-xs text-outline font-medium">{schedulesByCourse[course].length} Student(s)</p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-outline transition-transform ${expandedCourse === course ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {expandedCourse === course && (
                <div className="p-4 border-t border-outline-variant/30 space-y-6 bg-white">
                  {schedulesByCourse[course].map((userSchedule) => (
                    <div key={userSchedule.uid} className="space-y-3">
                      <h4 className="font-bold text-sm text-on-surface border-b border-outline-variant/20 pb-2">
                        {userSchedule.name}
                      </h4>
                      {userSchedule.entries.length === 0 ? (
                        <p className="text-xs text-outline">No subjects registered.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {userSchedule.entries.map((entry, idx) => {
                            const color = getColorForSubject(entry.subject);
                            return (
                              <div key={idx} className={`p-3 rounded-xl border ${color.border} ${color.bg} flex flex-col gap-1`}>
                                <p className={`font-bold text-xs truncate ${color.text}`}>{entry.subject}</p>
                                <div className="flex items-center justify-between text-[10px] text-outline mt-1">
                                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span>{entry.time}</span>
                                  <span className="font-medium bg-white/50 px-1.5 py-0.5 rounded">{entry.days}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-outline">
                                  <span className="flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[12px]">person</span>{entry.instructor}</span>
                                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">meeting_room</span>{entry.room}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
