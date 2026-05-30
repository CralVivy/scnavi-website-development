"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  role: "student" | "admin";
  photoURL?: string;
}

interface AuthSession {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuthSession(): AuthSession {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Fallback from Google displayName if no Firestore doc yet
            const nameParts = (firebaseUser.displayName || "").split(" ");
            setProfile({
              uid: firebaseUser.uid,
              firstName: nameParts[0] || "Student",
              lastName: nameParts.slice(1).join(" ") || "",
              email: firebaseUser.email || "",
              course: "Not Specified",
              role: "student",
              photoURL: firebaseUser.photoURL || undefined,
            });
          }
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
