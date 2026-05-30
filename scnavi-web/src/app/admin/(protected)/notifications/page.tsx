"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface UserProfile {
  uid: string;
  name: string;
  course: string;
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "course" | "user">("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const uList: UserProfile[] = [];
        const cSet = new Set<string>();

        snap.forEach((d) => {
          const data = d.data();
          const course = data.course || "Unassigned";
          const name = `${data.firstName} ${data.lastName}`.trim() || "Unknown";
          uList.push({ uid: d.id, name, course });
          cSet.add(course);
        });

        setUsers(uList.sort((a, b) => a.name.localeCompare(b.name)));
        const cArr = Array.from(cSet).sort();
        setCourses(cArr);
        if (cArr.length > 0) setSelectedCourse(cArr[0]);
        if (uList.length > 0) setSelectedUser(uList[0].uid);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setSuccess("");

    try {
      let targets: UserProfile[] = [];
      if (targetType === "all") {
        targets = users;
      } else if (targetType === "course") {
        targets = users.filter((u) => u.course === selectedCourse);
      } else if (targetType === "user") {
        targets = users.filter((u) => u.uid === selectedUser);
      }

      if (targets.length === 0) {
        throw new Error("No target users found.");
      }

      // Firestore Batch max is 500 operations. We'll just do a single batch assuming < 500 users for this demo.
      // For production, you'd chunk this into multiple batches.
      const batch = writeBatch(db);
      const notifRef = collection(db, "notifications");

      targets.forEach((u) => {
        const newDoc = doc(notifRef);
        batch.set(newDoc, {
          uid: u.uid,
          title: title.trim(),
          message: message.trim(),
          read: false,
          createdAt: new Date().toISOString(),
          type: "admin_alert"
        });
      });

      await batch.commit();

      setSuccess(`Successfully sent notification to ${targets.length} user(s).`);
      setTitle("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade max-w-3xl">
      <div>
        <h2 className="font-headline font-semibold text-2xl text-on-surface">Send Notification</h2>
        <p className="text-sm text-outline mt-0.5">Push announcements and alerts directly to students.</p>
      </div>

      <Card className="border border-outline-variant/30">
        <form onSubmit={handleSend} className="space-y-5">
          
          <div className="space-y-3 pb-5 border-b border-outline-variant/20">
            <label className="text-xs font-bold text-outline uppercase tracking-wider block">Target Audience</label>
            <div className="flex flex-wrap gap-3">
              {(["all", "course", "user"] as const).map((type) => (
                <label key={type} className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors ${targetType === type ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"}`}>
                  <input 
                    type="radio" 
                    name="target" 
                    value={type} 
                    checked={targetType === type} 
                    onChange={() => setTargetType(type)} 
                    className="hidden" 
                  />
                  <span className="capitalize">{type === "course" ? "By Section/Course" : type === "user" ? "Specific Student" : "All Students"}</span>
                </label>
              ))}
            </div>

            {targetType === "course" && (
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition appearance-none">
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {targetType === "user" && (
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition appearance-none">
                {users.map(u => <option key={u.uid} value={u.uid}>{u.name} ({u.course})</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Title</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="e.g. Urgent: Campus Closed Tomorrow"
              className="mt-1 w-full h-11 px-4 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary transition" 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Message</label>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              required 
              rows={4}
              placeholder="Type your message here..."
              className="mt-1 w-full px-4 py-3 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface resize-none focus:outline-none focus:border-primary transition" 
            />
          </div>

          {success && (
            <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {success}
            </div>
          )}

          <Button type="submit" disabled={sending || loading} className="w-full md:w-auto px-8">
            {sending ? "Sending..." : "Send Notification"}
            <span className="material-symbols-outlined text-[18px] ml-2">send</span>
          </Button>

        </form>
      </Card>
    </div>
  );
}
