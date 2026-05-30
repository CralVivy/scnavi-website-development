"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Academic:  "bg-primary/10 text-primary border-primary/20",
  Sports:    "bg-room-green/10 text-room-green border-room-green/20",
  Cultural:  "bg-violet-100 text-violet-600 border-violet-200",
  Seminar:   "bg-accent/10 text-accent border-accent/20",
  Other:     "bg-surface-container text-outline border-outline-variant/30",
};

// Static mock events — replaced by Firestore when admin adds real ones
const MOCK_EVENTS: CampusEvent[] = [
  { id: "1", title: "Intramural Games 2026", description: "Annual university intramural sports competitions open to all enrolled students.", date: "2026-06-10", timeStart: "7:00 AM", timeEnd: "5:00 PM", location: "BU Gymnasium", category: "Sports" },
  { id: "2", title: "Research Symposium", description: "College of Engineering research presentations and paper defenses.", date: "2026-06-15", timeStart: "8:00 AM", timeEnd: "5:00 PM", location: "CES Auditorium", category: "Academic" },
  { id: "3", title: "Founding Anniversary", description: "Bicol University's founding anniversary celebration with cultural performances.", date: "2026-07-05", timeStart: "9:00 AM", timeEnd: "8:00 PM", location: "BU Main Campus", category: "Cultural" },
  { id: "4", title: "Engineering Week", description: "Week-long activities, competitions, and seminars for engineering students.", date: "2026-07-21", timeStart: "8:00 AM", timeEnd: "5:00 PM", location: "CES Building", category: "Academic" },
];

export default function EventsPage() {
  const [events, setEvents] = useState<CampusEvent[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CampusEvent)));
        }
      } catch { /* use mock events */ }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  const categories = ["All", ...Array.from(new Set(events.map((e) => e.category)))];
  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter);

  return (
    <div className="space-y-6 animate-fade">
      <div>
        <h2 className="font-headline font-semibold text-3xl md:text-4xl tracking-tight text-on-surface">Campus Events</h2>
        <p className="text-base text-outline mt-1">Stay up to date with university activities and announcements.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              filter === cat
                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                : "bg-surface-container-lowest dark:bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">event</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline-variant">event_busy</span>
          <p className="font-semibold text-on-surface mt-3">No events found</p>
          <p className="text-sm text-outline mt-1">Check back later for upcoming activities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((event) => {
            const colorClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;
            const dateObj = new Date(event.date);
            const day = dateObj.toLocaleDateString("en-US", { day: "2-digit" });
            const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
            return (
              <Card key={event.id} className="flex flex-col gap-4 border border-outline-variant/20 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start gap-4">
                  {/* Date Block */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{month}</span>
                    <span className="text-[22px] font-black text-primary leading-none">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-base leading-snug group-hover:text-primary transition-colors">{event.title}</p>
                    <span className={`inline-block mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>{event.category}</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{event.description}</p>
                <div className="flex flex-wrap gap-2 pt-1 border-t border-outline-variant/20">
                  <span className="inline-flex items-center gap-1 text-xs text-outline">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {event.timeStart} – {event.timeEnd}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-outline">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {event.location}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
