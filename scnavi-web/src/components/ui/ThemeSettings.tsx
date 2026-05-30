"use client";
import React, { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Button } from "./Button";

export function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light" as const, label: "Light", icon: "light_mode" },
    { value: "dark"  as const, label: "Dark",  icon: "dark_mode" },
    { value: "system" as const, label: "System", icon: "contrast" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-outline-variant/30 transition-colors"
        title="Settings"
        id="theme-settings-btn"
      >
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="font-semibold text-base text-on-surface">Application Settings</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[20px] text-outline">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Appearance */}
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Appearance</p>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        theme === t.value
                          ? "border-primary bg-primary/10"
                          : "border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[26px] ${theme === t.value ? "text-primary ms-fill" : "text-outline"}`}>
                        {t.icon}
                      </span>
                      <span className={`text-xs font-semibold ${theme === t.value ? "text-primary" : "text-on-surface-variant"}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Notifications</p>
                <div className="space-y-2">
                  {[
                    { label: "Push Notifications", defaultOn: true },
                    { label: "Email Alerts", defaultOn: false },
                  ].map((item) => (
                    <label key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container cursor-pointer transition-colors">
                      <span className="text-sm font-medium text-on-surface">{item.label}</span>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${item.defaultOn ? "bg-primary" : "bg-outline-variant/40"}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${item.defaultOn ? "right-1" : "left-1"}`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-0">
              <Button onClick={() => setIsOpen(false)} className="w-full" size="md">Done</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
