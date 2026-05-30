"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";


export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { name: "Conflict Detection", href: "/admin/conflicts", icon: "warning" },
    { name: "Room Management", href: "/admin/rooms", icon: "meeting_room" },
    { name: "Floor Plan Builder", href: "/admin/floorplan", icon: "architecture" },
    { name: "Class Schedules", href: "/admin/schedules", icon: "calendar_month" },
    { name: "Campus Events", href: "/admin/events", icon: "event" },
    { name: "Feedback & Ratings", href: "/admin/feedback", icon: "rate_review" },
    { name: "Send Notifications", href: "/admin/notifications", icon: "notifications" },
    { name: "User Management", href: "/admin/users", icon: "manage_accounts" },
  ];

  return (
    <aside
      className={`bg-sidebar text-slate-400 flex flex-col h-screen sticky top-0 overflow-y-auto hide-scrollbar transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined ms-fill text-primary text-[28px]">
            explore
          </span>
          {!collapsed && (
            <div>
              <span className="font-headline font-bold text-white text-[22px] leading-none block">
                SCNavi
              </span>
              <span className="text-[11px] text-slate-500 uppercase tracking-widest block">
                Admin Portal
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-white"
        >
          <span className="material-symbols-outlined">
            {collapsed ? "menu" : "menu_open"}
          </span>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "hover:bg-sidebar-active hover:text-slate-200"
              }`}
              title={collapsed ? item.name : undefined}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isActive ? "ms-fill" : ""
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left hover:bg-sidebar-active hover:text-slate-200 transition-colors text-slate-400">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && (
          <div className="px-4 pt-2 pb-1">
            <p className="text-[11px] text-slate-500 truncate">
              admin@bicol-u.edu.ph
            </p>
            <p className="text-[10px] text-slate-600">Super Admin</p>
          </div>
        )}
      </div>
    </aside>
  );
}
