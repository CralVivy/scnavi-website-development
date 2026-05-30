"use client";
import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";

interface ScheduleEntry {
  uid: string;
  name: string;
  course: string;
  subject: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
}

interface Conflict {
  id: string;
  room: string;
  day: string;
  entry1: ScheduleEntry;
  entry2: ScheduleEntry;
}

export default function AdminConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConflicts = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to view conflicts.");
      }
      
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/conflicts", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load conflicts.");
      }

      setConflicts(data.conflicts || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load conflicts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We can set a small listener/retry or just run on mount when current user might be resolved.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchConflicts();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 animate-fade">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-semibold text-2xl text-on-surface">Conflict Detection</h2>
          <p className="text-sm text-outline mt-0.5">Automatically scan student schedules to detect double-booked rooms and overlapping times.</p>
        </div>
        <button 
          onClick={fetchConflicts} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors shadow-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">sync</span>
        </div>
      ) : conflicts.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant/40">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px] text-green-500">check_circle</span>
          </div>
          <p className="font-semibold text-on-surface">No Conflicts Detected</p>
          <p className="text-sm text-outline mt-1">All uploaded schedules are perfectly synchronized.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium text-sm">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            Found {conflicts.length} potential scheduling conflict(s).
          </div>

          {conflicts.map((c) => (
            <Card key={c.id} className="border border-red-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500"></div>
              <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg text-xs font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[14px]">meeting_room</span> {c.room}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-1 rounded-lg text-xs font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span> {c.day}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded-md">Conflict</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                {/* Entry 1 */}
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <p className="font-bold text-sm text-on-surface">{c.entry1.subject}</p>
                  <p className="text-[11px] text-outline mt-0.5">{c.entry1.course}</p>
                  
                  <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
                    <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> {c.entry1.time}</p>
                    <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">person</span> {c.entry1.instructor}</p>
                  </div>
                </div>

                {/* Entry 2 */}
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <p className="font-bold text-sm text-on-surface">{c.entry2.subject}</p>
                  <p className="text-[11px] text-outline mt-0.5">{c.entry2.course}</p>
                  
                  <div className="mt-3 space-y-1 text-xs text-on-surface-variant">
                    <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> {c.entry2.time}</p>
                    <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">person</span> {c.entry2.instructor}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
