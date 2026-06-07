"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/firebase";
import {
  collection, getDocs, orderBy, query, doc, updateDoc, Timestamp, onSnapshot
} from "firebase/firestore";

interface Feedback {
  id: string;
  uid: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  status: "pending" | "reviewed";
  createdAt: Timestamp | null;
}
const formatTimestamp = (createdAt: any) => {
  if (!createdAt) return "Pending date...";
  const dateObj = typeof createdAt.toDate === "function" 
    ? createdAt.toDate() 
    : new Date(createdAt);
  
  return isNaN(dateObj.getTime()) 
    ? "Invalid date" 
    : dateObj.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      });
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Feedback)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markReviewed = async (id: string) => {
    await updateDoc(doc(db, "feedback", id), { status: "reviewed" });
    setItems((prev) => prev.map((f) => f.id === id ? { ...f, status: "reviewed" } : f));
  };

  const filtered = filter === "all" ? items : items.filter((f) => f.status === filter);
  const pending = items.filter((f) => f.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline font-semibold text-2xl text-on-surface">Feedback</h2>
        <p className="text-sm text-outline mt-0.5">
          {pending > 0 ? <span className="text-room-red font-semibold">{pending} pending review{pending > 1 ? "s" : ""}</span> : "All feedback reviewed"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "reviewed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all capitalize ${filter === f ? "bg-primary text-white border-primary" : "bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:border-primary/40"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Android App Banner */}
      <Card className="bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">android</span>
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm">Download the Feedback App</p>
            <p className="text-xs text-outline mt-0.5">Test the dedicated Android app for submitting feedback directly.</p>
          </div>
        </div>
        <a 
          href="https://drive.google.com/file/d/15rATrP0RjtZfeDqKBtqrkXmITVgSc3nz/view?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          Download APK
        </a>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">rate_review</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant/40">
          <span className="material-symbols-outlined text-[56px] text-outline-variant">inbox</span>
          <p className="font-semibold text-on-surface mt-3">No feedback here</p>
          <p className="text-sm text-outline mt-1">Students will submit feedback from their dashboard.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className={`border transition-all ${item.status === "pending" ? "border-room-red/20 bg-room-red/5" : "border-outline-variant/20"}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                  {(item.name ?? "Anonymous User").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-on-surface text-sm">{item.name}</p>
                    <span className="text-xs text-outline">{item.email}</span>
                    {item.status === "pending" && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-room-red/10 text-room-red border border-room-red/20">New</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`material-symbols-outlined text-[16px] ${s <= item.rating ? "text-accent ms-fill" : "text-outline-variant"}`}>star</span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{item.message}</p>
                  {item.createdAt && (
                    <p className="text-xs text-outline mt-2">
                      {formatTimestamp(item.createdAt)}
                    </p>
                  )}
                </div>
                {item.status === "pending" && (
                  <button onClick={() => markReviewed(item.id)} className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity">
                    Mark Reviewed
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
