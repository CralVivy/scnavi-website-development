"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { LandingHeaderAuth } from "@/components/layout/LandingHeaderAuth";
import { LandingHeroCTA } from "@/components/layout/LandingHeroCTA";

/* ── Feature Data ────────────────────────────────────── */
const FEATURES = [
  {
    id: "navigation",
    icon: "map",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    title: "Smart Navigation",
    description: "Find classrooms, offices, and facilities instantly with an interactive campus map. Click any building to see its floor plan and room availability.",
    detail: "Navigate the Bicol University campus without ever getting lost. SCNavi\u2019s interactive map lets you click on any building to explore its floor plan, see which rooms are on each level, and check their real-time availability status \u2014 all without GPS tracking or privacy concerns.",
  },
  {
    id: "schedules",
    icon: "calendar_month",
    iconBg: "bg-room-green/10",
    iconColor: "text-room-green",
    title: "Class Schedule Management",
    description: "Upload your COR and let SCNavi automatically parse and organize your weekly class schedule. Never miss a room change again.",
    detail: "Simply upload your Certificate of Registration (COR) and SCNavi reads it using OCR technology, automatically extracting your subjects, room assignments, time slots, and instructors. Your full weekly schedule is then visible on a clean timetable, and you receive reminders 30 minutes before each class starts.",
  },
  {
    id: "conflicts",
    icon: "warning",
    iconBg: "bg-room-red/10",
    iconColor: "text-room-red",
    title: "Conflict Detection",
    description: "Automated scheduling analysis prevents double bookings and overlapping instructor assignments before they become a problem.",
    detail: "For administrators and faculty, SCNavi continuously analyzes all uploaded class schedules to identify conflicts \u2014 two classes assigned to the same room at the same time, or an instructor scheduled for two rooms simultaneously. Conflicts are flagged with severity levels and actionable resolution suggestions.",
  },
  {
    id: "rooms",
    icon: "meeting_room",
    iconBg: "bg-room-yellow/10",
    iconColor: "text-room-yellow",
    title: "Real-time Room Status",
    description: "See at a glance whether any room is available, occupied, or under maintenance \u2014 updated live by faculty and administrators.",
    detail: "Every room in the campus floor plan has a live status badge: green for Available, orange for Occupied, red for Maintenance. Administrators and faculty can update room status from the admin portal, and changes appear instantly on every student\u2019s map view \u2014 no refresh required.",
  },
  {
    id: "events",
    icon: "event",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    title: "Campus Events Feed",
    description: "Stay updated with university announcements, academic deadlines, sports events, and cultural activities \u2014 all in one place.",
    detail: "The campus events feed aggregates all university activities into a single, filterable timeline. Browse by category (Academic, Sports, Cultural, Seminar), see event locations on the map, and never miss a deadline or campus gathering again.",
  },
];

/* ── Landing Page ────────────────────────────────────── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* ── Header ── */}
      <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">explore</span>
            <span className="font-headline font-bold text-on-surface text-[26px] tracking-tight">SCNavi</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-on-surface-variant" aria-label="Main navigation">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
          </nav>
          <div className="flex items-center gap-4">
            <LandingHeaderAuth />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <span className="material-symbols-outlined text-[24px] text-on-surface">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden bg-surface-container-lowest border-b border-outline-variant/30 flex flex-col px-6 py-4 gap-4" aria-label="Mobile navigation">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-on-surface font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-on-surface font-medium hover:text-primary transition-colors">Solutions</Link>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col relative z-10">
        {/* ── Hero — Split Layout ── */}
        <section className="w-full relative min-h-[90vh] flex items-center py-24 md:py-32 px-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image src="/images/bicol-u-bg.png" alt="Bicol University Campus" fill className="object-cover object-center" priority fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/95 via-surface-container-lowest/80 to-surface-container-lowest/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 font-bold text-sm w-fit">
                <span className="material-symbols-outlined text-[18px] text-accent">new_releases</span>
                <span className="text-primary">Introducing</span>
                <span className="text-accent">SCNavi</span>
                <span className="text-on-surface-variant">for BU</span>
              </div>

              <h1 className="font-headline font-extrabold text-[36px] sm:text-[48px] md:text-[64px] leading-[1.1] tracking-tight">
                <span className="text-primary">Navigate Your Campus</span> <br className="hidden md:block" />
                <span className="text-accent">With Intelligence.</span>
              </h1>

              <p className="text-lg md:text-xl text-on-surface-variant max-w-lg">
                The smart campus navigation system designed to help you find rooms, avoid schedule conflicts, and stay updated with real-time campus events.
              </p>

              <LandingHeroCTA />

              {/* Social Proof */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex -space-x-2">
                  {[
                    { bg: "#4285F4", initials: "JD" },
                    { bg: "#34C759", initials: "MA" },
                    { bg: "#FF9500", initials: "RB" },
                  ].map(({ bg, initials }, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: bg, zIndex: 3 - i }}>
                      {initials}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant">
                    +2K
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Trusted by thousands of <span className="font-semibold text-on-surface">Bicol University</span> students and faculty.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="relative hidden md:flex items-center justify-center w-full h-[500px]">
              {/* Soft background glow shape behind the image */}
              <div className="absolute inset-10 bg-primary/20 blur-[80px] rounded-full" />
              
              {/* Image container that strictly enforces rounded corners */}
              <div className="relative z-10 w-[90%] max-w-lg rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/20">
                <Image 
                  src="/images/hero-mockup.png" 
                  alt="SCNavi App Mockup" 
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="w-full bg-surface-container-lowest py-24 border-t border-outline-variant/20 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Features</p>
              <h2 className="font-headline font-bold text-[36px] md:text-[48px] text-on-surface">Everything you need, in one place.</h2>
              <p className="text-on-surface-variant mt-4 text-lg">Powerful features built for both students and faculty.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((f) => (
                <div key={f.id} id={`feature-${f.id}`} className="flex flex-col p-8 rounded-3xl bg-surface hover:shadow-card transition-all border border-transparent hover:border-outline-variant/30 group">
                  <div className={`w-14 h-14 ${f.iconBg} ${f.iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-[28px]">{f.icon}</span>
                  </div>
                  <h3 className="text-[20px] font-bold text-on-surface mb-3">{f.title}</h3>
                  <p className="text-on-surface-variant flex-1">{f.description}</p>
                  <a href={`#feature-${f.id}-detail`} className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm mt-6 hover:gap-3 transition-all">
                    Learn more <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              ))}
            </div>

            {/* Feature Detail Rows */}
            <div className="mt-16 space-y-16">
              {FEATURES.map((f) => (
                <div key={f.id} id={`feature-${f.id}-detail`} className="flex flex-col md:flex-row gap-8 items-center scroll-mt-24 p-8 rounded-3xl bg-surface border border-outline-variant/20">
                  <div className="flex-1">
                    <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                      <span className={`material-symbols-outlined text-[24px] ${f.iconColor}`}>{f.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-on-surface mb-3">{f.title}</h3>
                    <p className="text-on-surface-variant leading-relaxed">{f.detail}</p>
                    <Link href="/login" className="inline-flex items-center gap-2 text-primary font-semibold text-sm mt-6 hover:underline">
                      Try it now <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="w-full md:w-2/5 aspect-video bg-surface-container rounded-2xl border border-outline-variant/20 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[48px] ${f.iconColor}`}>{f.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Solutions / Stats ── */}
        <section id="solutions" className="w-full bg-surface-container-lowest py-24 border-t border-outline-variant/20 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary mb-6">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Built for the Bicol University Community
                </div>
                <h2 className="font-headline font-bold text-[36px] md:text-[44px] text-on-surface leading-tight mb-4">
                  Smarter campus life<br />starts here.
                </h2>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg">
                  SCNavi is designed to make every day on campus easier, more connected, and stress-free — for students, faculty, and administrators alike.
                </p>
              </div>
              <div className="flex flex-row lg:flex-col gap-8 lg:gap-6 lg:items-end">
                {[
                  { icon: "group", value: "2K+", label: "Active Users" },
                  { icon: "corporate_fare", value: "5+", label: "Campus Locations" },
                  { icon: "event", value: "10+", label: "Events This Month" },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="flex flex-col items-center lg:items-end gap-1 text-center lg:text-right">
                    <span className="material-symbols-outlined text-[32px] text-primary">{icon}</span>
                    <p className="font-headline font-bold text-[40px] text-on-surface leading-none">{value}</p>
                    <p className="text-sm text-outline font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full py-24 px-6 bg-surface-container-low border-t border-outline-variant/20">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-primary">send</span>
            </div>
            <h2 className="font-headline font-bold text-[32px] md:text-[40px] text-on-surface leading-tight">
              Ready to experience a smarter campus?
            </h2>
            <p className="text-on-surface-variant text-lg">
              Join thousands of students and faculty already using SCNavi.
            </p>
            <Link href="/login">
              <Button size="lg" className="shadow-xl shadow-primary/20 text-lg px-10 flex items-center gap-2">
                Log In
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full bg-sidebar py-16 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined ms-fill text-primary text-[32px]">explore</span>
              <span className="font-headline font-bold text-white text-[28px]">SCNavi</span>
            </div>
            <p className="text-sm leading-relaxed">
              The premier smart campus navigation system designed specifically for Bicol University students and faculty.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {[
                { href: "https://facebook.com", label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { href: "https://twitter.com", label: "Twitter", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                { href: "https://instagram.com", label: "Instagram", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 20.5h9a5 5 0 005-5v-9a5 5 0 00-5-5h-9a5 5 0 00-5 5v9a5 5 0 005 5z" },
              ].map(({ href, label, path }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                   className="w-9 h-9 rounded-xl bg-slate-700/50 hover:bg-primary/20 flex items-center justify-center transition-colors group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-primary transition-colors">
                    <path d={path} />
                  </svg>
                </a>
              ))}
              <a href="mailto:support@bicol-u.edu.ph" aria-label="Email"
                 className="w-9 h-9 rounded-xl bg-slate-700/50 hover:bg-primary/20 flex items-center justify-center transition-colors group">
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary transition-colors">mail</span>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Navigation</h4>
              <Link href="#features" className="text-sm hover:text-white transition-colors">Features</Link>
              <Link href="#solutions" className="text-sm hover:text-white transition-colors">Solutions</Link>
              <Link href="/login" className="text-sm hover:text-white transition-colors">Log In</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Legal</h4>
              <Link href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-sm hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="text-sm hover:text-white transition-colors">Accessibility</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contact</h4>
              <a href="mailto:support@bicol-u.edu.ph" className="text-sm hover:text-white transition-colors">support@bicol-u.edu.ph</a>
              <p className="text-sm">Legazpi City, Albay, Philippines</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">© 2026 Bicol University · Blockers United. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Powered by Next.js & Firebase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
