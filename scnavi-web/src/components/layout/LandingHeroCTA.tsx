"use client";

import React from "react";
import Link from "next/link";
import { useAuthSession } from "@/lib/useAuthSession";
import { Button } from "@/components/ui/Button";

export function LandingHeroCTA() {
  const { user, profile, loading } = useAuthSession();

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-pulse">
        <div className="h-14 w-full sm:w-48 bg-surface-container rounded-lg"></div>
        <div className="h-14 w-full sm:w-40 bg-surface-container rounded-lg"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link href="/login" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/20 text-lg px-10">
            Log In
          </Button>
        </Link>
      </div>
    );
  }

  const role = profile?.role || "student";
  const portalRoute = role === "admin" ? "/admin/dashboard" : "/dashboard";
  const portalText = role === "admin" ? "Enter SCNavi Portal" : "Enter Student Portal";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      <Link href={portalRoute} className="w-full sm:w-auto">
        <Button
          size="lg"
          className="w-full sm:w-auto shadow-xl shadow-primary/20 text-lg px-8 flex items-center gap-2"
        >
          {portalText}
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Button>
      </Link>
    </div>
  );
}
