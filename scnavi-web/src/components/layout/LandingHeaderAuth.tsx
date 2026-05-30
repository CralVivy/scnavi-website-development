"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuthSession } from "@/lib/useAuthSession";
import { useTheme } from "@/lib/ThemeContext";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

export function LandingHeaderAuth() {
  const { user, profile, loading } = useAuthSession();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 sm:gap-4 animate-pulse">
        <div className="h-10 w-20 bg-surface-container rounded-md"></div>
        <div className="h-10 w-24 bg-surface-container rounded-md"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/login">
          <Button variant="ghost" className="text-sm sm:text-base">
            Log In
          </Button>
        </Link>
        <Link href="/register">
          <Button className="text-sm sm:text-base">Get Started</Button>
        </Link>
      </div>
    );
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user.displayName || "User";
  const course = profile?.course || "Bicol University";
  const role = profile?.role || "student";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const portalRoute = role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Pill Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 bg-surface-container hover:bg-surface-container-high transition-colors rounded-full pl-1 pr-4 py-1 cursor-pointer border border-outline-variant/20"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="hidden lg:block leading-tight text-left">
          <p className="text-sm font-semibold text-on-surface">{displayName}</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
          {dropdownOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade flex flex-col">
          <div className="p-4 border-b border-outline-variant/20 bg-surface-container/20 flex flex-col gap-1">
            <p className="font-bold text-sm text-on-surface truncate">{displayName}</p>
            <p className="text-xs text-outline font-medium truncate">{course}</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10 py-2">
            <Link
              href={portalRoute}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container/30 transition-colors text-sm font-medium text-on-surface"
              onClick={() => setDropdownOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px] text-primary">
                dashboard
              </span>
              {role === "admin" ? "Admin Portal" : "Student Portal"}
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container/30 transition-colors text-sm font-medium text-on-surface"
              onClick={() => setDropdownOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                person
              </span>
              Profile & Settings
            </Link>

            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container/30 transition-colors text-sm font-medium text-on-surface text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  {theme === "dark" ? "dark_mode" : "light_mode"}
                </span>
                Dark Mode
              </div>
              {/* Simple Toggle UI */}
              <div
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  theme === "dark" ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() => {
                auth.signOut();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container/30 transition-colors text-sm font-medium text-room-red text-left"
            >
              <span className="material-symbols-outlined text-[20px] text-room-red">
                logout
              </span>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
