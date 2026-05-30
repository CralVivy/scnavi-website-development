"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { UserProfile } from "@/lib/useAuthSession";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUid, setProcessingUid] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const fetched: UserProfile[] = [];
      snap.forEach((d) => {
        fetched.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setUsers(fetched);
    } catch (err) {
      console.error("Error fetching users", err);
      setError("Failed to load users. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user: UserProfile) => {
    if (!auth.currentUser) return;
    setProcessingUid(user.uid);
    setError("");
    const newRole = user.role === "admin" ? "student" : "admin";
    
    try {
      const token = await auth.currentUser.getIdToken();
      
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          targetEmail: user.email,
          newRole: newRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to promote user");
      }

      // Update local state to reflect success
      setUsers(users.map(u => u.uid === user.uid ? { ...u, role: newRole } : u));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setProcessingUid(null);
    }
  };

  return (
    <div className="animate-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-headline font-semibold text-2xl text-on-surface">User Management</h2>
          <p className="text-sm text-outline">Promote students to administrators via Custom Claims</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container border-b border-outline-variant/30 text-outline uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-outline">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-outline">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.uid} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-on-surface">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4 text-outline">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container text-outline border border-outline-variant/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleRole(u)} 
                      disabled={processingUid === u.uid}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        processingUid === u.uid ? 'opacity-50 cursor-wait bg-surface-container text-outline' :
                        u.role === 'admin' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-primary text-white shadow-md hover:opacity-90'
                      }`}
                    >
                      {processingUid === u.uid ? "Processing..." : u.role === 'admin' ? "Demote to Student" : "Promote to Admin"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
