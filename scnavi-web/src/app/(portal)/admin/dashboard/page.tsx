"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

export default function AdminDashboardPage() {
  const [conflictCount, setConflictCount] = useState<number | null>(null);
  const [roomCount, setRoomCount] = useState<number | null>(null);
  const [feedbackPending, setFeedbackPending] = useState<number | null>(null);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [recentConflicts, setRecentConflicts] = useState<any[]>([]);

  // Live feedback count
  useEffect(() => {
    const q = query(collection(db, "feedback"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, (snap) => setFeedbackPending(snap.size));
    return () => unsub();
  }, []);

  // Live events count
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => setEventCount(snap.size));
    return () => unsub();
  }, []);

  // Room count from mapData
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const snap = await getDocs(collection(db, "mapData"));
        let count = 0;
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.buildings) count += data.buildings.length;
        });
        setRoomCount(count);
      } catch { setRoomCount(0); }
    };
    fetchRooms();
  }, []);

  // Conflict count (uses existing API)
  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const { auth } = await import("@/lib/firebase");
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/conflicts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConflictCount(data.conflicts?.length ?? 0);
          setRecentConflicts((data.conflicts ?? []).slice(0, 3));
        }
      } catch { setConflictCount(0); }
    };
    fetchConflicts();
  }, []);

  const [normalizing, setNormalizing] = useState(false);

  const handleNormalize = async () => {
    if (!window.confirm("Run data normalization? This will update schedules and user courses globally.")) return;
    setNormalizing(true);
    try {
      const { auth } = await import("@/lib/firebase");
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/normalize", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Normalization failed");
      alert(data.message);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setNormalizing(false);
    }
  };

  const statNum = (v: number | null) =>
    v === null ? "…" : v.toString();

  return (
    <div className="space-y-6 animate-fade">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="flex flex-col border-t-4 border-room-red">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Conflicts</span>
            <span className="material-symbols-outlined text-room-red text-[22px]">warning</span>
          </div>
          <p className="text-[32px] font-bold text-room-red">{statNum(conflictCount)}</p>
          <p className="text-xs text-outline mt-1">Detected in all schedules</p>
        </Card>
        
        <Card className="flex flex-col border-t-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Buildings</span>
            <span className="material-symbols-outlined text-primary text-[22px]">meeting_room</span>
          </div>
          <p className="text-[32px] font-bold text-on-surface">{statNum(roomCount)}</p>
          <p className="text-xs text-outline mt-1">Registered on campus map</p>
        </Card>

        <Card className="flex flex-col border-t-4 border-pink-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Feedback</span>
            <span className="material-symbols-outlined text-pink-500 text-[22px]">rate_review</span>
          </div>
          <p className="text-[32px] font-bold text-on-surface">{statNum(feedbackPending)}</p>
          <p className="text-xs text-outline mt-1">Pending reviews</p>
        </Card>

        <Card className="flex flex-col border-t-4 border-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-outline uppercase font-bold tracking-wider">Events</span>
            <span className="material-symbols-outlined text-accent text-[22px]">event</span>
          </div>
          <p className="text-[32px] font-bold text-on-surface">{statNum(eventCount)}</p>
          <p className="text-xs text-outline mt-1">Published events</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conflicts */}
        <Card className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-base text-on-surface">Recent Schedule Conflicts</h3>
            <Link href="/admin/conflicts">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          {recentConflicts.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center gap-2">
              <span className="material-symbols-outlined text-[48px] text-outline-variant">verified</span>
              <p className="font-semibold text-on-surface text-sm">No conflicts detected</p>
              <p className="text-xs text-outline">All schedules are conflict-free.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConflicts.map((c: any) => (
                <div key={c.id} className="border-l-4 border-room-red bg-room-red/5 rounded-r-xl p-4">
                  <p className="font-semibold text-sm text-on-surface">{c.room} — Double Booking</p>
                  <p className="text-xs text-outline mt-1">
                    {c.entry1?.subject} vs {c.entry2?.subject} · {c.day} {c.entry1?.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <Card className="col-span-1">
          <h3 className="font-semibold text-base text-on-surface mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/admin/floorplan" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary text-[22px]">architecture</span>
              <span className="text-sm font-medium text-on-surface">Floor Plan Builder</span>
            </Link>
            <Link href="/admin/rooms" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary text-[22px]">meeting_room</span>
              <span className="text-sm font-medium text-on-surface">Room Management</span>
            </Link>
            <Link href="/admin/events" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-accent text-[22px]">event</span>
              <span className="text-sm font-medium text-on-surface">Manage Events</span>
            </Link>
            <Link href="/admin/feedback" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-pink-500 text-[22px]">rate_review</span>
              <span className="text-sm font-medium text-on-surface">Review Feedback</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">manage_accounts</span>
              <span className="text-sm font-medium text-on-surface">User Management</span>
            </Link>
            <button 
              onClick={handleNormalize}
              disabled={normalizing}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-emerald-500 text-[22px] ${normalizing ? "animate-spin" : ""}`}>
                {normalizing ? "sync" : "database"}
              </span>
              <span className="text-sm font-medium text-on-surface">{normalizing ? "Normalizing..." : "Normalize Data"}</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
