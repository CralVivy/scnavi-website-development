"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, orderBy, query, serverTimestamp,
} from "firebase/firestore";

interface CampusEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  category: string;
}

const BLANK: Omit<CampusEvent, "id"> = {
  title: "", description: "", date: "", timeStart: "", timeEnd: "", location: "", category: "Academic",
};
const CATEGORIES = ["Academic", "Sports", "Cultural", "Seminar", "Other"];

const renderDateBadge = (dateString: string) => {
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex flex-col items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-outline uppercase">TBD</span>
        <span className="text-xl font-black text-outline leading-none">--</span>
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
      <span className="text-[10px] font-bold text-primary uppercase">
        {parsedDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
      </span>
      <span className="text-xl font-black text-primary leading-none">
        {parsedDate.toLocaleDateString("en-US", { day: "2-digit" })}
      </span>
    </div>
  );
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<CampusEvent, "id">>(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchEvents = async () => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const snap = await getDocs(q);
    setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CampusEvent)));
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), { ...form });
      } else {
        await addDoc(collection(db, "events"), { ...form, createdAt: serverTimestamp() });
      }
      setForm(BLANK);
      setEditingId(null);
      setShowForm(false);
      await fetchEvents();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (event: CampusEvent) => {
    const { id, ...rest } = event;
    setForm(rest);
    setEditingId(id!);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await deleteDoc(doc(db, "events", id));
    await fetchEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-semibold text-2xl text-on-surface">Events Management</h2>
          <p className="text-sm text-outline mt-0.5">Create and manage campus events visible to students.</p>
        </div>
        <Button onClick={() => { setForm(BLANK); setEditingId(null); setShowForm(true); }} size="sm">
          <span className="material-symbols-outlined text-[18px] mr-1.5">add</span>
          New Event
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border border-primary/20">
          <h3 className="font-semibold text-base text-on-surface mb-5">{editingId ? "Edit Event" : "Create New Event"}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Event Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Engineering Week 2026"
                className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
            </div>
            <div>
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required placeholder="Describe the event..."
                className="mt-1 w-full px-4 py-3 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required
                  className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Start Time</label>
                <input type="time" value={form.timeStart} onChange={(e) => setForm({ ...form, timeStart: e.target.value })} required
                  className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">End Time</label>
                <input type="time" value={form.timeEnd} onChange={(e) => setForm({ ...form, timeEnd: e.target.value })} required
                  className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="e.g. CES Auditorium"
                  className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition appearance-none">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(BLANK); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">event</span>
        </div>
      ) : events.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center border border-dashed border-outline-variant/40">
          <span className="material-symbols-outlined text-[56px] text-outline-variant">event_busy</span>
          <p className="font-semibold text-on-surface mt-3">No events yet</p>
          <p className="text-sm text-outline mt-1">Click "New Event" to add the first campus event.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="flex items-start gap-4 border border-outline-variant/20 hover:border-primary/30 transition-all">
              {renderDateBadge(event.date)}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface">{event.title}</p>
                <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">{event.description}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-outline">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{event.timeStart} – {event.timeEnd}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{event.location}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium border border-outline-variant/30">{event.category}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(event)} className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                </button>
                <button onClick={() => handleDelete(event.id!)} className="w-8 h-8 rounded-lg hover:bg-room-red/10 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[18px] text-room-red">delete</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
