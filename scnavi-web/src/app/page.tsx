import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Top Navigation */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">
              explore
            </span>
            <span className="font-headline font-bold text-on-surface text-[26px] tracking-tight">
              SCNavi
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-on-surface-variant">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <main className="flex-1 flex flex-col relative z-10">
        <section className="w-full relative flex flex-col items-center justify-center py-32 md:py-48 px-6 text-center min-h-[85vh]">
          {/* Background Image & Light Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image 
              src="/images/bicol-u-bg.png"
              alt="Bicol University Campus"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Light gradient overlay — white wash fading to surface */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-surface/95"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
            {/* Light Glassmorphism Container */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-8 md:p-14 rounded-[32px] shadow-2xl flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 border border-accent/20 font-bold text-sm mb-8">
                <span className="material-symbols-outlined text-[18px] text-accent">new_releases</span>
                <span className="text-primary">Introducing</span>
                <span className="text-accent">SCNavi</span>
                <span className="text-on-surface-variant">for Bicol University</span>
              </div>
              
              <h1 className="font-headline font-extrabold text-[48px] md:text-[72px] leading-[1.1] tracking-tight mb-8">
                <span className="text-primary">Navigate Your Campus</span> <br className="hidden md:block" />
                <span className="text-accent">With Intelligence.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12">
                The smart campus navigation system designed to help you find rooms, avoid schedule conflicts, and stay updated with real-time campus events.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary/20 text-lg px-8">
                    Create an Account
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                    Student Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Abstract Visual / App Preview */}
        <section className="w-full max-w-6xl mx-auto px-6 pb-24">
          <div className="w-full aspect-video bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
            {/* Minimal mockup representation */}
            <div className="w-3/4 h-3/4 bg-white rounded-xl shadow-card border border-outline-variant/20 flex flex-col overflow-hidden relative z-10">
              <div className="h-12 border-b border-outline-variant/20 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-room-red"></div>
                <div className="w-3 h-3 rounded-full bg-room-yellow"></div>
                <div className="w-3 h-3 rounded-full bg-room-green"></div>
              </div>
              <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                  <div className="h-8 bg-surface-container rounded-lg w-3/4"></div>
                  <div className="h-32 bg-surface-container-low rounded-lg w-full"></div>
                  <div className="h-24 bg-surface-container-low rounded-lg w-full"></div>
                </div>
                <div className="col-span-2 bg-surface-container-low rounded-lg w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-outline-variant/50">map</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="w-full bg-white py-24 border-t border-outline-variant/20">
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
      <footer className="w-full bg-sidebar py-12 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="material-symbols-outlined ms-fill text-white text-[24px]">explore</span>
            <span className="font-headline font-bold text-white text-[20px]">SCNavi</span>
          </div>
          <p className="text-sm">© 2026 Bicol University · Blockers United. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
