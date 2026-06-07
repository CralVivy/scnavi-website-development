"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthSession } from "@/lib/useAuthSession";
import { BU_CAMPUSES } from "@/lib/buCourses";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ThemeSettings } from "@/components/ui/ThemeSettings";

export default function ProfilePage() {
  const PREMADE_AVATARS = [
    // Notionists (diverse people & backgrounds)
    "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Milo&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jude&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Leo&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Jack&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Nala&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/notionists/svg?seed=Kofi&backgroundColor=b6e3f4",
    
    // Personas & Adventurer (highly diverse skin colors, hair styles and genders)
    "https://api.dicebear.com/7.x/personas/svg?seed=Aria&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/personas/svg?seed=Caleb&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/personas/svg?seed=Jordan&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/personas/svg?seed=Yuki&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Lulu&backgroundColor=ffd5dc",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Scooter&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Patches&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Garfield&backgroundColor=b6e3f4",
    
    // Cute Animals (high quality square-cropped profile photography)
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face&q=80", // Cat
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop&crop=face&q=80", // Golden Retriever
    "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=150&h=150&fit=crop&crop=face&q=80", // Bunny
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=150&h=150&fit=crop&crop=face&q=80", // Fox
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face&q=80", // Golden Retriever Puppy
    "https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=150&h=150&fit=crop&crop=face&q=80", // Koala
    "https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=150&h=150&fit=crop&crop=face&q=80", // Red Panda
  ];

  const { user, profile, loading } = useAuthSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ course: "", photoURL: "" });
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPushEnabled(localStorage.getItem("scnavi_push_notifs") === "true");
      setAlertsEnabled(localStorage.getItem("scnavi_schedule_alerts") !== "false"); // default true
    }
  }, []);

  const togglePush = () => {
    const newVal = !pushEnabled;
    setPushEnabled(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("scnavi_push_notifs", String(newVal));
      if (newVal && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  };

  const toggleAlerts = () => {
    const newVal = !alertsEnabled;
    setAlertsEnabled(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("scnavi_schedule_alerts", String(newVal));
    }
  };

  // Pre-fill form and cascading state when profile loads
  React.useEffect(() => {
    if (profile) {
      const savedCourse = profile.course || "Not Specified";
      setForm({ 
        course: savedCourse, 
        photoURL: profile.photoURL || "" 
      });

      // Reverse-lookup: find the campus & college that contains the saved course
      if (savedCourse !== "Not Specified") {
        for (const campus of BU_CAMPUSES) {
          for (const college of campus.colleges) {
            if (college.courses.includes(savedCourse)) {
              setSelectedCampus(campus.name);
              setSelectedCollege(college.name);
              return;
            }
          }
        }
      }
    }
  }, [profile]);

  const activeCampus = BU_CAMPUSES.find((c) => c.name === selectedCampus);
  const activeCollege = activeCampus?.colleges.find((c) => c.name === selectedCollege);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        course: form.course,
        photoURL: form.photoURL,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-[48px] text-outline-variant animate-pulse">person</span>
      </div>
    );
  }

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : user?.displayName || "Student";
  const initials = displayName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6 animate-fade max-w-2xl mx-auto">
      <div>
        <h2 className="font-headline font-semibold text-3xl md:text-4xl tracking-tight text-on-surface">My Profile</h2>
        <p className="text-base text-outline mt-1">Manage your account information and preferences.</p>
      </div>

      {saved && (
        <div className="bg-room-green/10 border border-room-green/20 text-room-green px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Profile updated successfully!
        </div>
      )}

      {/* Avatar + Basic Info */}
      <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border border-outline-variant/20">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black shrink-0">
          {profile?.photoURL
            ? <img src={profile.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-2xl text-on-surface">{displayName}</p>
          <p className="text-on-surface-variant mt-0.5">{profile?.course || "—"}</p>
          <p className="text-sm text-outline mt-0.5">{user?.email}</p>
          <div className="flex justify-center sm:justify-start mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
              <span className="material-symbols-outlined text-[14px]">school</span>
              {profile?.role === "admin" ? "Admin" : "Student"}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit Profile
        </Button>
      </Card>

      {/* Edit Form */}
      {editing && (
        <Card className="border border-primary/20">
          <h3 className="font-semibold text-base text-on-surface mb-5">Edit Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Read-only name display */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-outline uppercase tracking-wide">Display Name</label>
              <p className="px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface-container text-sm text-on-surface-variant">
                {displayName}
                <span className="ml-2 text-xs text-outline">(from your Google account)</span>
              </p>
            </div>

            {/* Avatar Selection */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-semibold text-outline uppercase tracking-wide">Choose Avatar</label>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {/* Option to clear avatar (revert to initials/Google default if any) */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, photoURL: "" })}
                  className={`w-14 h-14 rounded-full shrink-0 flex items-center justify-center font-bold text-lg border-2 transition-transform hover:scale-105 ${form.photoURL === "" ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-surface-container text-on-surface-variant"}`}
                >
                  {initials}
                </button>
                {PREMADE_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm({ ...form, photoURL: url })}
                    className={`w-14 h-14 rounded-full shrink-0 border-2 transition-transform hover:scale-105 overflow-hidden ${form.photoURL === url ? "border-primary scale-110 shadow-md shadow-primary/20" : "border-transparent opacity-80 hover:opacity-100"}`}
                  >
                    <img src={url} alt={`avatar-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Cascading Course Selection */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold text-outline uppercase tracking-wide">Course / Program</p>

              {/* Step 1: Campus */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-on-surface-variant">Campus</label>
                <select
                  value={selectedCampus}
                  onChange={(e) => {
                    const campusName = e.target.value;
                    setSelectedCampus(campusName);
                    
                    const campusObj = BU_CAMPUSES.find((c) => c.name === campusName);
                    const validColleges = campusObj ? campusObj.colleges.filter(c => c.courses.length > 0) : [];
                    
                    if (validColleges.length === 1) {
                      setSelectedCollege(validColleges[0].name);
                    } else {
                      setSelectedCollege("");
                    }
                    
                    setForm((prev) => ({ ...prev, course: "Not Specified" }));
                  }}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                >
                  <option value="">— Select Campus —</option>
                  {BU_CAMPUSES.map((campus) => (
                    <option key={campus.name} value={campus.name}>{campus.name}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: College */}
              {activeCampus && (
                <div className="flex flex-col gap-1.5 animate-fade">
                  <label className="text-[11px] font-medium text-on-surface-variant">College / Institute</label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => {
                      setSelectedCollege(e.target.value);
                      setForm((prev) => ({ ...prev, course: "Not Specified" }));
                    }}
                    disabled={saving}
                    className="px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                  >
                    <option value="">— Select College —</option>
                    {activeCampus.colleges
                      .filter((c) => c.courses.length > 0)
                      .map((college) => (
                        <option key={college.name} value={college.name}>{college.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Step 3: Course */}
              {activeCollege && activeCollege.courses.length > 0 && (
                <div className="flex flex-col gap-1.5 animate-fade">
                  <label className="text-[11px] font-medium text-on-surface-variant">Course / Program</label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
                    disabled={saving}
                    className="px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                  >
                    <option value="Not Specified">— Select Course —</option>
                    {activeCollege.courses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Current selection display */}
              {form.course && form.course !== "Not Specified" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                  <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                  <span className="text-on-surface font-medium">{form.course}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Account Details */}
      <Card className="border border-outline-variant/20 space-y-3">
        <h3 className="font-semibold text-base text-on-surface">Account Details</h3>
        {[
          { label: "Email", value: user?.email || "—", icon: "email" },
          { label: profile?.role === "admin" ? "Faculty ID" : "Student ID", value: user?.uid?.slice(0, 12) + "…", icon: "badge" },
          { label: "Account Type", value: profile?.role === "admin" ? "Administrator" : "Student", icon: "verified_user" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-outline-variant/20 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
              </div>
              <span className="text-sm font-medium text-on-surface-variant">{item.label}</span>
            </div>
            <span className="text-sm text-on-surface font-semibold">{item.value}</span>
          </div>
        ))}
      </Card>

      {/* Preferences */}
      <Card className="border border-outline-variant/20 space-y-3">
        <h3 className="font-semibold text-base text-on-surface mb-2">Preferences</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
          <div>
            <p className="text-sm font-semibold text-on-surface">App Theme</p>
            <p className="text-xs text-outline mt-0.5">Choose your preferred appearance.</p>
          </div>
          <ThemeSettings />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-outline-variant/20">
          <div>
            <p className="text-sm font-semibold text-on-surface">Push Notifications</p>
            <p className="text-xs text-outline mt-0.5">Receive browser notifications for admin announcements.</p>
          </div>
          <button 
            onClick={togglePush}
            className={`w-11 h-6 rounded-full transition-colors relative ${pushEnabled ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pushEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-semibold text-on-surface">Schedule Alerts</p>
            <p className="text-xs text-outline mt-0.5">Get notified 30 minutes before your next class starts.</p>
          </div>
          <button 
            onClick={toggleAlerts}
            className={`w-11 h-6 rounded-full transition-colors relative ${alertsEnabled ? 'bg-primary' : 'bg-surface-container'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${alertsEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </Card>

      {/* Sign Out */}
      <Card className="border border-outline-variant/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-room-red/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-room-red text-[22px]">logout</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Sign Out</p>
              <p className="text-xs text-outline mt-0.5">You will be redirected to the login page.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="border-room-red text-room-red hover:bg-room-red/10">
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
