"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch user's role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === "admin") {
        router.push("/admin/dashboard");
      } else {
        // Not an admin, sign out immediately
        await signOut(auth);
        setError("Access Denied: You do not have administrator privileges.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4 hover:scale-105 transition-transform">
            <span className="material-symbols-outlined ms-fill text-primary text-[48px]">explore</span>
          </Link>
          <h1 className="font-headline font-bold text-[36px] text-white tracking-tight">SCNavi Admin</h1>
          <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-medium">Campus Management Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
          <form className="flex flex-col gap-5" onSubmit={handleAdminLogin}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Admin Email</label>
              <input 
                type="email" 
                placeholder="admin@bicol-u.edu.ph" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-[14px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 text-[14px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full mt-2 shadow-primary/20" disabled={loading}>
              {loading ? "Signing In..." : "Sign In as Admin"}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          Authorized personnel only · Bicol University SCNavi
        </p>
      </div>
    </div>
  );
}
