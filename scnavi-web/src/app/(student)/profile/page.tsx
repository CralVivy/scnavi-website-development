"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthSession } from "@/lib/useAuthSession";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ThemeSettings } from "@/components/ui/ThemeSettings";

export default function ProfilePage() {
  const { user, profile, loading } = useAuthSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", course: "" });
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

  // Pre-fill form when profile loads
  React.useEffect(() => {
    if (profile) setForm({ firstName: profile.firstName, lastName: profile.lastName, course: profile.course });
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        course: form.course,
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
            <Input
              label="Course / Program"
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              required
            />
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
          { label: "Student ID", value: user?.uid?.slice(0, 12) + "…", icon: "badge" },
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
