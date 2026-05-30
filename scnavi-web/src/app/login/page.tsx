"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth, db, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFriendlyErrorMessage = (error: any) => {
    console.error("Firebase login error details:", error);
    const code = error.code || "";
    if (code === "auth/operation-not-allowed") {
      return "Login failed: The Email/Password provider is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable it.";
    }
    if (code === "auth/invalid-api-key" || error.message?.includes("API key")) {
      return "Login failed: Invalid Firebase API Key. Please check your .env.local and restart your dev server.";
    }
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    return error.message || "Failed to sign in. Please check your details.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Enforce BU email constraint
    if (!email.endsWith("@bicol-u.edu.ph")) {
      setError("Login Restricted: Only Bicol University email addresses (@bicol-u.edu.ph) are permitted.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Enforce @bicol-u.edu.ph domain restriction
      if (!user.email || !user.email.endsWith("@bicol-u.edu.ph")) {
        await signOut(auth);
        throw new Error("Access Restricted: Only accounts with a Bicol University email (@bicol-u.edu.ph) are permitted.");
      }
      
      // Check if user document already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create a new student user document
        const displayName = user.displayName || "";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "Student";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        await setDoc(userDocRef, {
          uid: user.uid,
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          course: "Not Specified",
          role: "student",
          createdAt: new Date().toISOString()
        });
      }
      
      router.push("/dashboard");
      
    } catch (err: any) {
      console.error("Google sign in error details:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google Sign-In popup was closed before completion.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError("Google Sign-In is not enabled in your Firebase Console. Go to Authentication > Sign-in method and enable the Google provider.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex">
      {/* Left half: Branding / Hero */}
      <div className="hidden lg:flex w-1/2 bg-surface-container-low flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Image & Light/Dark Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image 
            src="/images/bicol-u-bg.png"
            alt="Bicol University Campus"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Light gradient overlay — white wash fading to surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-surface/95 dark:from-surface-container-low/90 dark:via-surface-container-low/75 dark:to-surface/95"></div>
        </div>
        
        <Link href="/" className="relative z-10 flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
          <span className="material-symbols-outlined ms-fill text-primary text-[32px]">explore</span>
          <span className="font-headline font-bold text-on-surface text-[24px]">SCNavi</span>
        </Link>
 
        <div className="relative z-10 max-w-md">
          <h1 className="font-headline font-bold text-[48px] leading-tight text-on-surface mb-6">
            Welcome back to your smart campus.
          </h1>
          <p className="text-lg text-on-surface-variant">
            Sign in to check your personalized schedule, find your next class, and navigate the university with ease.
          </p>
        </div>
 
        <div className="relative z-10 text-sm text-outline font-medium uppercase tracking-widest">
          Bicol University · Blockers United
        </div>
      </div>
 
      {/* Right half: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md flex flex-col">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity w-fit">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">explore</span>
            <span className="font-headline font-bold text-on-surface text-[24px]">SCNavi</span>
          </Link>
 
          <h2 className="text-[32px] font-bold text-on-surface tracking-tight mb-2">Sign in</h2>
          <p className="text-on-surface-variant mb-10">Use your university email to access the portal.</p>
 
          {error && (
            <div className="bg-room-red/10 border border-room-red/20 text-room-red px-4 py-3 rounded-xl mb-6 text-sm font-medium leading-snug">
              {error}
            </div>
          )}
 
          <form className="flex flex-col gap-6 mb-6" onSubmit={handleLogin}>
            <Input 
              type="email" 
              placeholder="e.g. juan.delacruz@bicol-u.edu.ph" 
              label="University Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required 
            />
            
            <div className="flex flex-col gap-1.5">
              <Input 
                type="password" 
                placeholder="••••••••" 
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required 
              />
              <div className="text-right">
                <Link href="#" className="text-sm font-bold text-accent hover:underline">Forgot Password?</Link>
              </div>
            </div>
 
            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant/30"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface-container-lowest px-2 text-outline font-semibold">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 flex items-center justify-center gap-3 active:scale-98 transition-all hover:bg-surface-container mb-8"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>
 
          <div className="text-center">
            <p className="text-sm text-outline">
              Don't have an account? <Link href="/register" className="font-bold text-primary hover:underline ml-1">Enroll now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
