"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    course: "BS Computer Engineering"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const getFriendlyErrorMessage = (error: any) => {
    console.error("Firebase registration error details:", error);
    const code = error.code || "";
    if (code === "auth/operation-not-allowed") {
      return "Registration failed: The Email/Password provider is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable it.";
    }
    if (code === "auth/invalid-api-key" || error.message?.includes("API key")) {
      return "Registration failed: Invalid Firebase API Key. Please double check your .env.local file and restart your npm dev server.";
    }
    if (code === "auth/email-already-in-use") {
      return "This email is already registered. Please log in instead.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. It must be at least 6 characters.";
    }
    return error.message || "Failed to register. Please check your network connection and details.";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Ensure email is student email
    if (!formData.email.endsWith("@bicol-u.edu.ph")) {
      setError("Registration Restricted: Only Bicol University email addresses (@bicol-u.edu.ph) are permitted.");
      setLoading(false);
      return;
    }
    
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Save additional data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        course: formData.course,
        role: "student",
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      // Wait briefly then user can navigate
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
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
      
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-primary/5"></div>
      
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-card border border-outline-variant/30 p-8 sm:p-10 relative z-10 animate-fade">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">explore</span>
            <span className="font-headline font-bold text-on-surface text-[24px]">SCNavi</span>
          </Link>
          <h1 className="font-headline font-bold text-[28px] text-on-surface tracking-tight mt-4">Create an Account</h1>
          <p className="text-on-surface-variant text-sm mt-1">Join the smart campus navigation system.</p>
        </div>

        {error && (
          <div className="bg-room-red/10 border border-room-red/20 text-room-red px-4 py-3 rounded-xl mb-6 text-sm font-medium leading-snug" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-room-green/10 border border-room-green/20 text-room-green px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            Registration successful! Redirecting...
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              label="First Name" 
              placeholder="Juan" 
              required 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              disabled={loading}
              autoComplete="given-name"
            />
            <Input 
              label="Last Name" 
              placeholder="Dela Cruz" 
              required 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              disabled={loading}
              autoComplete="family-name"
            />
          </div>
          
          <Input 
            type="email"
            label="University Email" 
            placeholder="juan.delacruz@bicol-u.edu.ph" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            disabled={loading}
            autoComplete="email"
          />
          
          <Input 
            label="Course / Program" 
            placeholder="BS Computer Engineering" 
            required 
            value={formData.course}
            onChange={(e) => setFormData({...formData, course: e.target.value})}
            disabled={loading}
          />

          <Input 
            type="password"
            label="Password" 
            placeholder="••••••••" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            minLength={6}
            disabled={loading}
            autoComplete="new-password"
          />

          <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </Button>
        </form>

        <div className="relative my-6">
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
          className="w-full h-12 flex items-center justify-center gap-3 active:scale-98 transition-all hover:bg-surface-container"
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
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-outline mt-8">
          Already have an account? <Link href="/login" className="font-bold text-primary hover:underline ml-1">Log in</Link>
        </p>
      </div>
    </div>
  );
}
