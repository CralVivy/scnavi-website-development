"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { LandingHeaderAuth } from "@/components/layout/LandingHeaderAuth";
import { LandingHeroCTA } from "@/components/layout/LandingHeroCTA";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Top Navigation */}
      <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">
              explore
            </span>
            <span className="font-headline font-bold text-on-surface text-[26px] tracking-tight">
              SCNavi
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-on-surface-variant" aria-label="Main navigation">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
          </nav>
          <div className="flex items-center gap-4">
            <LandingHeaderAuth />
            {/* Mobile Hamburger Menu Toggle */}
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
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-surface-container-lowest border-b border-outline-variant/30 flex flex-col px-6 py-4 gap-4" aria-label="Mobile navigation">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-on-surface font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-on-surface font-medium hover:text-primary transition-colors">Solutions</Link>
            <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="text-on-surface font-medium hover:text-primary transition-colors">Admin Portal</Link>
          </nav>
        )}
      </header>

      {/* Hero Section with Background Image */}
      <main id="main-content" className="flex-1 flex flex-col relative z-10">
        <section className="w-full relative flex flex-col items-center justify-center py-32 md:py-48 px-6 text-center min-h-[85vh]">
          {/* Background Image & Light Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image 
              src="/images/bicol-u-bg.png"
              alt="Bicol University Campus"
              fill
              className="object-cover object-center"
              priority
              fetchPriority="high"
            />
            {/* Light gradient overlay — white wash fading to surface */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-surface-container-lowest/75 to-surface/95"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            {/* Light Glassmorphism Container */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-xl border border-outline-variant/30 p-8 md:p-14 rounded-[32px] shadow-2xl flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 font-bold text-sm mb-8">
                <span className="material-symbols-outlined text-[18px] text-accent">new_releases</span>
                <span className="text-primary">Introducing</span>
                <span className="text-accent">SCNavi</span>
                <span className="text-on-surface-variant">for Bicol University</span>
              </div>
              
              <h1 className="font-headline font-extrabold text-[36px] sm:text-[48px] md:text-[72px] leading-[1.1] tracking-tight mb-8">
                <span className="text-primary">Navigate Your Campus</span> <br className="hidden md:block" />
                <span className="text-accent">With Intelligence.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12">
                The smart campus navigation system designed to help you find rooms, avoid schedule conflicts, and stay updated with real-time campus events.
              </p>
              
              <LandingHeroCTA />
            </div>
          </div>
        </section>

        {/* Abstract Visual / App Preview */}
        <section className="w-full max-w-6xl mx-auto px-6 pb-24">
          <div className="w-full aspect-video bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
            {/* Polished SVG Illustration Representation */}
            <div className="w-4/5 h-4/5 flex items-center justify-center relative z-10">
              <svg width="100%" height="100%" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dashboard Card Background */}
                <rect x="50" y="50" width="700" height="400" rx="24" fill="var(--color-surface-container-lowest)" stroke="var(--color-outline-variant)" strokeOpacity="0.3" strokeWidth="2" className="shadow-2xl"/>
                
                {/* Header elements */}
                <rect x="90" y="90" width="180" height="24" rx="12" fill="var(--color-primary)" fillOpacity="0.1"/>
                <rect x="90" y="130" width="120" height="16" rx="8" fill="var(--color-outline-variant)" fillOpacity="0.4"/>
                
                <circle cx="700" cy="100" r="20" fill="var(--color-primary)"/>
                
                {/* Main Content Areas */}
                <rect x="90" y="180" width="300" height="230" rx="16" fill="var(--color-surface-container-low)"/>
                <rect x="410" y="180" width="340" height="230" rx="16" fill="var(--color-primary)" fillOpacity="0.05"/>
                
                {/* Map/Path visualization in right card */}
                <path d="M460 250 Q 500 200, 580 250 T 700 220" stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 10"/>
                <circle cx="460" cy="250" r="10" fill="var(--color-primary)"/>
                <circle cx="700" cy="220" r="10" fill="var(--color-accent)"/>
                <circle cx="700" cy="220" r="4" fill="white"/>
                
                {/* Content lines in left card */}
                <rect x="120" y="220" width="240" height="12" rx="6" fill="var(--color-outline-variant)" fillOpacity="0.5"/>
                <rect x="120" y="250" width="200" height="12" rx="6" fill="var(--color-outline-variant)" fillOpacity="0.3"/>
                <rect x="120" y="280" width="220" height="12" rx="6" fill="var(--color-outline-variant)" fillOpacity="0.3"/>
                
                <rect x="120" y="340" width="140" height="36" rx="18" fill="var(--color-primary)"/>
              </svg>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="w-full bg-surface-container-lowest py-24 border-t border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline font-bold text-[36px] md:text-[48px] text-on-surface">Everything you need, in one place.</h2>
              <p className="text-on-surface-variant mt-4 text-lg">Powerful features built for both students and faculty.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-surface hover:shadow-card transition-shadow">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">map</span>
                </div>
                <h3 className="text-[22px] font-bold text-on-surface mb-3">Smart Navigation</h3>
                <p className="text-on-surface-variant">Find classrooms, offices, and facilities instantly with our interactive visual campus map.</p>
              </div>
              
              <div className="p-8 rounded-3xl bg-surface hover:shadow-card transition-shadow">
                <div className="w-14 h-14 bg-room-red/10 text-room-red rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">warning</span>
                </div>
                <h3 className="text-[22px] font-bold text-on-surface mb-3">Conflict Detection</h3>
                <p className="text-on-surface-variant">Automated scheduling scans to prevent double bookings and overlapping instructor schedules.</p>
              </div>
              
              <div className="p-8 rounded-3xl bg-surface hover:shadow-card transition-shadow">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[28px]">event</span>
                </div>
                <h3 className="text-[22px] font-bold text-on-surface mb-3">Real-time Events</h3>
                <p className="text-on-surface-variant">Stay updated with campus activities, exams, and announcements happening today.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
          </div>
          
          <div className="flex flex-wrap gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Navigation</h4>
              <Link href="#features" className="text-sm hover:text-white transition-colors">Features</Link>
              <Link href="#solutions" className="text-sm hover:text-white transition-colors">Solutions</Link>
              <Link href="/login" className="text-sm hover:text-white transition-colors">Student Login</Link>
              <Link href="/admin/login" className="text-sm hover:text-white transition-colors">Admin Portal</Link>
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
