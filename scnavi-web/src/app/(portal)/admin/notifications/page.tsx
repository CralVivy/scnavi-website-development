"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, writeBatch, doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface UserProfile {
  uid: string;
  name: string;
  course: string;
}

interface SentAnnouncement {
  title: string;
  message: string;
  type: "admin_alert" | "advisory";
  createdAt: string;
  docIds: string[];
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "course" | "user">("all");
  const [msgType, setMsgType] = useState<"admin_alert" | "advisory">("admin_alert");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");

  const [sentAnnouncements, setSentAnnouncements] = useState<SentAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const uList: UserProfile[] = [];
        const cSet = new Set<string>();

        snap.forEach((d) => {
          const data = d.data();
          const course = data.course || "Unassigned";
          const name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown";
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

  useEffect(() => {
    const q = collection(db, "notifications");
    const unsubscribe = onSnapshot(q, (snap) => {
      const groups: Record<string, SentAnnouncement> = {};

      snap.forEach((d) => {
        const data = d.data();
        const t = data.title || "";
        const m = data.message || "";
        const type = data.type || "admin_alert";
        const createdAt = data.createdAt || "";
        const key = `${t}|${m}|${createdAt}`;
        if (!groups[key]) {
          groups[key] = {
            title: t,
            message: m,
            type,
            createdAt,
            docIds: []
          };
        }
        groups[key].docIds.push(d.id);
      });

      const list = Object.values(groups).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSentAnnouncements(list);
      setLoadingAnnouncements(false);
    });

    return () => unsubscribe();
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
          type: msgType
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

  const handleDeleteAnnouncement = async (docIds: string[]) => {
    if (!window.confirm(`Are you sure you want to take down this announcement? This will delete it for all targeted students.`)) {
      return;
    }
    try {
      await Promise.all(docIds.map(id => deleteDoc(doc(db, "notifications", id))));
      alert("Announcement successfully taken down.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to take down announcement: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade w-full">
      <div>
        <h2 className="font-headline font-semibold text-2xl text-on-surface">Announcements & Alerts</h2>
        <p className="text-sm text-outline mt-0.5">Manage and push announcements directly to students.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Send Notification Form */}
        <div className="lg:col-span-5">
          <Card className="border border-outline-variant/30">
            <h3 className="font-bold text-lg text-on-surface mb-4">Send Notification</h3>
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

              <div className="space-y-3 pb-5 border-b border-outline-variant/20">
                <label className="text-xs font-bold text-outline uppercase tracking-wider block">Message Type</label>
                <div className="flex flex-wrap gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors ${msgType === "admin_alert" ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"}`}>
                    <input 
                      type="radio" 
                      name="msgType" 
                      value="admin_alert" 
                      checked={msgType === "admin_alert"} 
                      onChange={() => setMsgType("admin_alert")} 
                      className="hidden" 
                    />
                    <span>Standard Alert</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors ${msgType === "advisory" ? "border-amber-500 bg-amber-500/10 text-amber-600 font-semibold" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"}`}>
                    <input 
                      type="radio" 
                      name="msgType" 
                      value="advisory" 
                      checked={msgType === "advisory"} 
                      onChange={() => setMsgType("advisory")} 
                      className="hidden" 
                    />
                    <span>Campus Advisory</span>
                  </label>
                </div>
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

        {/* Right Column: Active Announcements list */}
        <div className="lg:col-span-7">
          <Card className="border border-outline-variant/30">
            <h3 className="font-bold text-lg text-on-surface mb-4">Active Announcements</h3>
            {loadingAnnouncements ? (
              <div className="flex flex-col items-center py-12 text-outline">
                <span className="material-symbols-outlined text-[36px] animate-spin">sync</span>
                <p className="text-xs font-medium mt-2">Loading announcements...</p>
              </div>
            ) : sentAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-outline">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">campaign</span>
                <p className="text-xs font-medium mt-2">No active announcements sent yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {sentAnnouncements.map((ann, i) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all ${
                    ann.type === "advisory" 
                      ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10" 
                      : "bg-surface-container-low border-outline-variant/20 hover:bg-surface-container"
                  } flex items-start justify-between gap-4`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ann.type === "advisory" 
                            ? "bg-amber-500/15 text-amber-700" 
                            : "bg-primary/15 text-primary"
                        }`}>
                          {ann.type === "advisory" ? "Campus Advisory" : "Standard Alert"}
                        </span>
                        <span className="text-[10px] text-outline">
                          {new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-outline-variant font-medium">• Sent to {ann.docIds.length} user(s)</span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface truncate">{ann.title}</h4>
                      <p className="text-xs text-outline mt-1 leading-relaxed whitespace-pre-wrap">{ann.message}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(ann.docIds)}
                      className="text-outline hover:text-room-red p-1.5 hover:bg-room-red/10 rounded-full transition-colors flex-shrink-0"
                      title="Take down announcement"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
