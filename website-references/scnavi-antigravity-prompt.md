# Antigravity Prompt: SCNavi Website Audit & Improvement
## Based on The Complete Web Design Playbook Best Practices

---

## YOUR ROLE

You are a senior UI/UX engineer and design systems expert. You will audit, improve, and rewrite the SCNavi codebase based on a comprehensive web design best practices guide. Every change you make must be grounded in a specific best practice principle. Do not make arbitrary style changes — each improvement must fix a documented issue.

---

## WHAT SCNAVI IS

SCNavi is a smart campus navigation web app built for **Bicol University** students and faculty. It is a **Next.js 15 + TypeScript + Tailwind CSS v4** project using Firebase for auth/data. It has two user roles:

- **Students**: Dashboard, interactive campus map, schedule viewer, events, profile
- **Admins**: Floorplan editor, schedule conflict detection, user management, notifications

The site already has a solid foundation: a Material Design-inspired color system, dark mode, mobile bottom navigation, and a clean component architecture. This audit improves it further without ripping it apart.

---

## FULL CODEBASE CONTEXT

### `src/app/globals.css` — Design Tokens

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-primary: #0A84FF;
  --color-primary-dark: #005db8;
  --color-accent: #FF9500;
  
  --color-surface: #f9f9fb;
  --color-surface-admin: #f3f4f6;
  --color-surface-container: #eeeef0;
  --color-surface-container-low: #f3f3f5;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-high: #e8e8ea;
  
  --color-on-surface: #1a1c1d;
  --color-on-surface-variant: #414754;
  --color-outline: #717786;
  --color-outline-variant: #c0c6d6;
  --color-inactive: #8E8E93;
  
  --color-room-red: #FF3B30;
  --color-room-green: #34C759;
  --color-room-yellow: #FFD60A;
  
  --color-sidebar: #0f172a;
  --color-sidebar-active: #1e293b;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-headline: var(--font-newsreader), ui-serif, Georgia, serif;
}

* { -webkit-tap-highlight-color: transparent; }
body { overscroll-behavior: none; }

@utility hide-scrollbar {
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@utility shadow-card {
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
}

.dark {
  --color-surface: #111318;
  --color-surface-container: #1d1f25;
  --color-surface-container-low: #191b21;
  --color-surface-container-lowest: #0c0e13;
  --color-surface-container-high: #272a31;
  --color-on-surface: #e2e2e9;
  --color-on-surface-variant: #c4c6d0;
  --color-outline: #8e909a;
  --color-outline-variant: #44474e;
  --color-inactive: #636366;
  --color-sidebar: #080a0f;
  --color-sidebar-active: #14171f;
  --color-surface-admin: #111318;
}

@utility animate-slide-in {
  animation: slideIn 0.2s ease-out;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@utility animate-fade {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### `src/app/layout.tsx` — Root Layout

```tsx
import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCNavi — Smart Campus Navigation",
  description: "Navigate Your Campus with Intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-surface text-on-surface" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### `src/app/page.tsx` — Landing Page

```tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { LandingHeaderAuth } from "@/components/layout/LandingHeaderAuth";
import { LandingHeroCTA } from "@/components/layout/LandingHeroCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined ms-fill text-primary text-[32px]">explore</span>
            <span className="font-headline font-bold text-on-surface text-[26px] tracking-tight">SCNavi</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-on-surface-variant">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
          </nav>
          <LandingHeaderAuth />
        </div>
      </header>

      <main className="flex-1 flex flex-col relative z-10">
        {/* Hero */}
        <section className="w-full relative flex flex-col items-center justify-center py-32 md:py-48 px-6 text-center min-h-[85vh]">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image src="/images/bicol-u-bg.png" alt="Bicol University Campus" fill className="object-cover object-center" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-surface-container-lowest/75 to-surface/95"></div>
          </div>
          <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
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

        {/* App Preview Placeholder */}
        <section className="w-full max-w-6xl mx-auto px-6 pb-24">
          <div className="w-full aspect-video bg-surface-container-low rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
            <div className="w-3/4 h-3/4 bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/20 flex flex-col overflow-hidden relative z-10">
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

        {/* Features */}
        <section id="features" className="w-full bg-surface-container-lowest py-24 border-t border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline font-bold text-[36px] md:text-[48px] text-on-surface">Everything you need, in one place.</h2>
              <p className="text-on-surface-variant mt-4 text-lg">Powerful features built for both students and faculty.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* 3 feature cards */}
            </div>
          </div>
        </section>
      </main>

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
```

### `src/components/ui/Button.tsx`

```tsx
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", fullWidth, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100";
    const variants = {
      primary: "bg-primary text-white shadow-lg",
      secondary: "bg-surface-container text-on-surface-variant",
      outline: "border-2 border-outline-variant text-on-surface hover:bg-surface-container",
      ghost: "text-primary hover:bg-primary/10",
    };
    const sizes = { sm: "h-9 px-3 text-sm", md: "h-12 px-5 text-base", lg: "h-14 px-6 text-lg" };
    return (
      <button ref={ref} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
```

### `src/components/ui/Input.tsx`

```tsx
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs text-outline uppercase font-bold tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-12 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-outline/60 transition-all text-[14px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 ${error ? "border-room-red focus:border-room-red focus:ring-room-red/15" : ""} ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-room-red font-medium">{error}</span>}
      </div>
    );
  }
);
```

### `src/components/layout/LandingHeaderAuth.tsx` — (abbreviated)

The header auth shows a profile pill dropdown for logged-in users with: name initials avatar, portal link, profile link, dark mode toggle, and sign out. For guests it shows "Log In" (ghost button) + "Get Started" (primary button).

The dropdown uses `animate-fade` on open, outside-click dismissal, but has NO `aria-expanded` state on the profile pill button and NO `aria-live` for announcements.

### `src/components/layout/StudentNav.tsx` — (abbreviated)

Desktop: Collapsible sidebar with icon + label nav items. Active items have `bg-primary text-white`. Collapsed mode shows icons only with `title` attribute for tooltip.

Mobile: Fixed bottom tab bar with icon + `text-[10px]` label. 5 items: Home, Map, Schedule, Events, Profile.

The sidebar toggle buttons have `title` attributes but no `aria-label`. The mobile bottom nav items have no `aria-current="page"` on active links.

### `src/app/login/page.tsx` — (abbreviated)

Two-column layout: left branding panel (hidden on mobile), right form. Form: email + password fields, submit button, Google OAuth divider + button. Has error display (form-level, shown above fields). Inputs use the `<Input>` component with labels. No `autocomplete` attributes on inputs.

### `src/app/register/page.tsx` — (abbreviated)

Centered card layout. Fields: First Name + Last Name (side-by-side on one row), University Email, Course/Program, Password. Has form-level error and success states. No `autocomplete` attributes. First name/last name side-by-side is a multi-column form layout.

---

## THE BEST PRACTICES REFERENCE (KEY PRINCIPLES)

The following are the governing rules from The Complete Web Design Playbook that apply directly to SCNavi:

### Typography
- Body text minimum: **16px** — inputs below 16px cause **iOS to auto-zoom** (critical bug)
- Maximum **2 typeface families** ✅ (Inter + Newsreader — BUT Inter is called out as a generic, overused font)
- Font loading: Use `font-display: swap` and `preconnect` to font CDN

### Color & Contrast (WCAG AA)
- Body text: minimum **4.5:1** contrast ratio
- UI components: minimum **3:1** contrast ratio
- Labels, captions: must also meet contrast thresholds — check `text-outline` (#717786) on white (#ffffff) — this is approximately **4.54:1**, which passes AA barely
- Never use color alone to convey information

### Spacing (8-Point Grid)
- All spacing should be multiples of 8px (4, 8, 16, 24, 32, 40, 48, 64...)

### Mobile-First & Responsive
- Touch targets: **minimum 44×44px**, ideally **48×48px**
- Touch target spacing: **8px minimum between targets**
- Mobile bottom nav labels: **minimum 12px** font size — 10px is a violation
- No hover-only interactions on touch devices
- Input font size: **minimum 16px** to prevent iOS keyboard zoom

### Accessibility (WCAG)
- `<nav>` elements must have `aria-label` to distinguish multiple navs on same page
- Active nav links: `aria-current="page"`
- Interactive dropdowns: `aria-expanded="true/false"` on trigger button
- Skip link: **"Skip to main content"** as first focusable element
- Focus rings: must be visible — never `outline: none` without replacement
- All buttons need `aria-label` when they contain only icons
- Modals/overlays need focus traps
- `prefers-reduced-motion` must be respected for all animations
- Sidebar toggle buttons with only icons need `aria-label`

### Forms
- **Single column** forms are easier to complete — avoid side-by-side field layouts
- `autocomplete` attributes on all auth form inputs
- Labels must be visually associated with inputs via `<label for="">` or wrapping
- Input font size: minimum **16px** (not 14px)
- Validate on blur, not on keystroke
- Error messages must be **linked to inputs** via `aria-describedby`

### Performance (Core Web Vitals)
- LCP image: needs `fetchpriority="high"` attribute in addition to `priority`
- The hero image `bicol-u-bg.png` is **9MB PNG** — must be converted to WebP or served via Next.js Image optimization (which it is — but original file size should still be reduced)
- `preconnect` for the **Material Symbols** Google Fonts CDN (currently missing)
- `prefers-reduced-motion` needed for all CSS animations

### Navigation
- Mobile hamburger menu needed on landing page — the desktop nav (`hidden md:flex`) disappears on mobile with NO mobile alternative (critical UX gap)
- `aria-current="page"` on active links
- Active page must be visually highlighted in nav

### Buttons
- Must have **hover states** — primary button currently has no hover color defined
- Must have **focus-visible** ring for keyboard users
- Loading state must disable button and show spinner

### Footer
- Should include navigation links, legal links (Privacy, Terms), contact info
- Currently extremely minimal (just logo + copyright)

### Content
- App preview section currently shows an empty wireframe placeholder — needs real content or a more descriptive placeholder

---

## SPECIFIC ISSUES TO FIX

Below is the complete audit of every issue found in the SCNavi codebase, with the exact best practice violated and the fix required.

---

### ISSUE 1 — CRITICAL: Mobile Nav Missing on Landing Page
**File**: `src/app/page.tsx`
**Best practice**: "Mobile hamburger menu — place top-right. Always include a visible × to close. Navigation must be reachable without interaction on desktop."
**Problem**: The header nav (`<nav className="hidden md:flex ...">`) is completely hidden below 768px with no mobile alternative. On mobile, users cannot access Features, Solutions, or Admin Portal links.
**Fix**: Add a hamburger button that appears on mobile (`md:hidden`), a slide-down or drawer overlay with the nav links, and a close button. Use `aria-expanded` and `aria-controls` on the hamburger. Ensure links have `min-h-[48px]` touch targets.

---

### ISSUE 2 — CRITICAL: Input Font Size Causes iOS Zoom
**File**: `src/components/ui/Input.tsx`
**Best practice**: "Font size minimum 16px in inputs (prevents iOS zoom)"
**Problem**: `text-[14px]` on the input element is below the 16px iOS threshold, which causes the entire page to zoom in when a user taps any input field on iPhone.
**Fix**: Change `text-[14px]` to `text-base` (16px).

---

### ISSUE 3 — CRITICAL: Register Form Has Side-by-Side Fields on Mobile
**File**: `src/app/register/page.tsx`
**Best practice**: "Single column layouts are easier to complete than multi-column forms (per research)"
**Problem**: `<div className="flex gap-4">` with First Name and Last Name side by side creates a two-column layout that is cramped on mobile screens.
**Fix**: On mobile, stack first name and last name vertically. Use `flex-col sm:flex-row gap-4` so they appear side-by-side only on tablet+.

---

### ISSUE 4 — CRITICAL: No Skip Navigation Link
**File**: `src/app/layout.tsx` or `src/app/page.tsx`
**Best practice**: "Add 'Skip to main content' link as first focusable element on page"
**Problem**: No skip link exists. Keyboard and screen reader users must tab through the entire header every time they load a page.
**Fix**: Add as the very first child of `<body>`:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-bold">
  Skip to main content
</a>
```
And add `id="main-content"` to the `<main>` element on relevant pages.

---

### ISSUE 5 — HIGH: Primary Button Has No Hover State
**File**: `src/components/ui/Button.tsx`
**Best practice**: "Every interactive element must have hover, focus, active, loading, and error states"
**Problem**: `primary: "bg-primary text-white shadow-lg"` — no `hover:` color variant. The button looks identical on hover and at rest.
**Fix**: Add hover and focus-visible states:
```
primary: "bg-primary hover:bg-primary-dark text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
```
Apply similar treatment to all variants (secondary, outline, ghost).

---

### ISSUE 6 — HIGH: No `prefers-reduced-motion` in CSS
**File**: `src/app/globals.css`
**Best practice**: "Respect `prefers-reduced-motion` CSS media query. Some users have vestibular disorders where motion causes physical discomfort."
**Problem**: `animate-slide-in` and `animate-fade` utilities run animations unconditionally for all users.
**Fix**: Add at the end of globals.css:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### ISSUE 7 — HIGH: Missing `autocomplete` on Auth Form Inputs
**Files**: `src/app/login/page.tsx`, `src/app/register/page.tsx`
**Best practice**: "autocomplete attributes on all fields" and "Mobile optimizations: autocomplete attributes on all fields"
**Problem**: No `autocomplete` attribute on any auth input. Password managers can't auto-fill; mobile browsers can't suggest saved credentials.
**Fix** — Login page:
```tsx
<Input type="email" autoComplete="email" label="University Email" ... />
<Input type="password" autoComplete="current-password" label="Password" ... />
```
**Fix** — Register page:
```tsx
<Input label="First Name" autoComplete="given-name" ... />
<Input label="Last Name" autoComplete="family-name" ... />
<Input type="email" autoComplete="email" label="University Email" ... />
<Input label="Course / Program" autoComplete="organization-title" ... />
<Input type="password" autoComplete="new-password" label="Password" ... />
```
Also update the `<Input>` component to pass through `autoComplete` (it already does via `...props`).

---

### ISSUE 8 — HIGH: Dropdown Profile Button Missing `aria-expanded`
**File**: `src/components/layout/LandingHeaderAuth.tsx`
**Best practice**: "`aria-expanded='true/false'`: On hamburger buttons and accordions"
**Problem**: The profile pill button (`<button onClick={() => setDropdownOpen(!dropdownOpen)}>`) has no `aria-expanded` attribute, so screen readers don't announce whether the dropdown is open or closed.
**Fix**:
```tsx
<button
  onClick={() => setDropdownOpen(!dropdownOpen)}
  aria-expanded={dropdownOpen}
  aria-haspopup="true"
  aria-label={`${displayName}'s account menu`}
  ...
>
```
Also add `role="menu"` to the dropdown container and `role="menuitem"` to each link/button inside it.

---

### ISSUE 9 — HIGH: Mobile Bottom Nav Labels Too Small
**File**: `src/components/layout/StudentNav.tsx`
**Best practice**: "Caption/Small: 12–14px (never below 12px)"
**Problem**: `text-[10px]` on mobile bottom nav labels is below the minimum 12px. Text at this size is illegible for many users, especially on small screens.
**Fix**: Change `text-[10px]` to `text-[12px]` or `text-xs`.

---

### ISSUE 10 — HIGH: Nav Elements Missing `aria-label`
**Files**: `src/app/page.tsx`, `src/components/layout/StudentNav.tsx`
**Best practice**: "Use `<nav>` semantic element with `aria-label='Main Navigation'`"
**Problem**: Multiple `<nav>` elements on the page (landing header nav, mobile bottom nav, sidebar nav) have no `aria-label` to differentiate them. Screen readers announce all as "navigation" with no distinction.
**Fix**:
- Landing header nav: `<nav aria-label="Main navigation" ...>`
- Student sidebar nav: `<nav aria-label="Student portal navigation" ...>`
- Mobile bottom nav: `<nav aria-label="Mobile navigation" ...>`

---

### ISSUE 11 — HIGH: Active Nav Links Missing `aria-current`
**File**: `src/components/layout/StudentNav.tsx`
**Best practice**: "Use `aria-current='page'` on active nav link"
**Problem**: Active links are visually distinguished (`bg-primary text-white`) but have no `aria-current="page"` attribute for screen readers.
**Fix**:
```tsx
<Link
  aria-current={isActive ? "page" : undefined}
  ...
>
```

---

### ISSUE 12 — HIGH: Sidebar Icon-Only Toggle Buttons Missing `aria-label`
**File**: `src/components/layout/StudentNav.tsx`
**Best practice**: "All buttons need `aria-label` when they contain only icons"
**Problem**: The collapse/expand sidebar buttons contain only a Material Symbol icon (`chevron_left` / `chevron_right`). They have `title` attributes (tooltip on hover) but `title` is NOT equivalent to `aria-label` for screen readers.
**Fix**:
```tsx
<button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={...} ...>
```

---

### ISSUE 13 — MEDIUM: No `preconnect` for Material Symbols Font CDN
**File**: `src/app/layout.tsx`
**Best practice**: "Preconnect to font CDN: `<link rel='preconnect'>`"
**Problem**: The layout loads Material Symbols from Google Fonts without a preconnect hint, adding latency to the connection setup on initial load.
**Fix**: Add before the stylesheet `<link>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

---

### ISSUE 14 — MEDIUM: Footer Is Too Minimal
**File**: `src/app/page.tsx` (footer section)
**Best practice**: "The footer is a second chance for navigation — include all major links. Essential footer elements: Logo, nav links, legal (Privacy, Terms), social icons, contact."
**Problem**: Footer only contains logo + copyright text. No navigation links, no legal pages, no contact info.
**Fix**: Expand the footer to include at minimum:
- Quick links column: Features, Admin Portal, Register, Log In
- Legal column: Privacy Policy link, Terms of Use link
- Contact/info: University name, team name
- Copyright row at the bottom

---

### ISSUE 15 — MEDIUM: App Preview Section Is an Empty Wireframe Placeholder
**File**: `src/app/page.tsx`
**Best practice**: "Imagery & Media — Authentic over stock. Empty states need design too."
**Problem**: The "app preview" section shows an animated wireframe skeleton that conveys nothing about the actual product. Users have no idea what the dashboard or map looks like.
**Fix**: Replace with one of:
(a) An actual screenshot of the dashboard or map page in a browser chrome mockup
(b) A polished illustration showing the map interface with labeled rooms
(c) A short feature highlight section with icons and descriptions if screenshots aren't available
At minimum, add descriptive text inside the placeholder: `<p>Dashboard preview coming soon</p>` with `aria-label` context.

---

### ISSUE 16 — MEDIUM: Input Component Labels Not Using `htmlFor`
**File**: `src/components/ui/Input.tsx`
**Best practice**: "Use `<label for='...'>` on all form inputs, never rely on placeholder text alone"
**Problem**: The `<label>` in the Input component wraps the input (implicit association), but there is no explicit `htmlFor` / `id` connection. Implicit association works in most browsers but explicit is the WCAG-compliant standard.
**Fix**: Add a generated or passed `id` to the input and link `htmlFor` on the label:
```tsx
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label htmlFor={inputId} className="text-xs text-outline uppercase font-bold tracking-wider">{label}</label>}
        <input ref={ref} id={inputId} ... />
        {error && <span id={`${inputId}-error`} className="text-sm text-room-red font-medium" role="alert">{error}</span>}
      </div>
    );
  }
);
```
Also add `aria-describedby={error ? `${inputId}-error` : undefined}` to the input.

---

### ISSUE 17 — MEDIUM: Form-Level Error Messages Not Linked to Inputs
**Files**: `src/app/login/page.tsx`, `src/app/register/page.tsx`
**Best practice**: "Error messages must be announced via `aria-live='polite'`"
**Problem**: The form error `<div>` appears dynamically but has no `aria-live` attribute. Screen readers won't announce it when it appears.
**Fix**:
```tsx
{error && (
  <div role="alert" aria-live="polite" className="bg-room-red/10 border border-room-red/20 text-room-red px-4 py-3 rounded-xl mb-6 text-sm font-medium leading-snug">
    {error}
  </div>
)}
```
The `role="alert"` implicitly sets `aria-live="assertive"` — use `assertive` for errors (they require immediate attention).

---

### ISSUE 18 — MEDIUM: No `fetchpriority` on LCP Hero Image
**File**: `src/app/page.tsx`
**Best practice**: "Add `fetchpriority='high'` to hero/LCP image"
**Problem**: Next.js `<Image priority>` handles preloading, but explicitly setting `fetchpriority` ensures the browser prioritizes this resource even before preload hints are parsed.
**Fix**:
```tsx
<Image
  src="/images/bicol-u-bg.png"
  alt="Bicol University Campus"
  fill
  className="object-cover object-center"
  priority
  fetchPriority="high"
/>
```

---

### ISSUE 19 — MEDIUM: Dark Mode Toggle Button Has No `aria-label`
**File**: `src/components/layout/LandingHeaderAuth.tsx`
**Best practice**: "All buttons need `aria-label` when they contain only icons or non-descriptive content"
**Problem**: The dark mode toggle button inside the dropdown has a text label "Dark Mode" which is fine. However the toggle switch itself (the pill/circle animation) is not interactive — the whole button triggers it. This is acceptable, but the button needs to clearly state the current AND target state.
**Fix**:
```tsx
<button
  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
  ...
>
```

---

### ISSUE 20 — LOW: Inter Font Is Overused / Generic
**File**: `src/app/layout.tsx`, `src/app/globals.css`
**Best practice**: "NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts)"
**Note**: This is a low-priority style preference. Inter is technically excellent and highly readable. The site's Newsreader headline font adds personality. However, if a font refresh is desired, consider replacing Inter body font with one of: **DM Sans**, **Plus Jakarta Sans**, **Geist** (Vercel's font), or **Figtree** — all have strong character while remaining equally readable.
**Fix (optional)**: Replace Inter with a more distinctive but equally legible sans-serif body font.

---

## WHAT TO PRODUCE

Apply every fix above to the relevant file. For each fix:

1. Show the **exact filename** being changed
2. Show the **before** snippet (the problematic code)
3. Show the **after** snippet (the corrected code)
4. Reference the **issue number** it resolves

Then produce the complete, final versions of these files with ALL fixes applied:
- `src/app/globals.css` — with `prefers-reduced-motion`, any animation improvements
- `src/app/layout.tsx` — with skip link, preconnect hints
- `src/app/page.tsx` — with mobile nav, improved footer, fixed aria on header nav
- `src/components/ui/Button.tsx` — with hover + focus-visible states on all variants
- `src/components/ui/Input.tsx` — with 16px font, explicit `htmlFor`, `aria-describedby`
- `src/components/layout/StudentNav.tsx` — with `aria-label`, `aria-current`, fixed label font size
- `src/components/layout/LandingHeaderAuth.tsx` — with `aria-expanded`, `aria-label`
- `src/app/login/page.tsx` — with `autocomplete`, `role="alert"` on errors
- `src/app/register/page.tsx` — with `autocomplete`, responsive field stacking, `role="alert"`

---

## CONSTRAINTS & RULES

- **Do not change the design language or color system** — the Material Design-inspired palette, dark mode, and Newsreader/Inter fonts are intentional and should be preserved
- **Do not change routing or Firebase logic** — only change UI/UX, HTML structure, CSS, and accessibility attributes
- **Preserve all existing Tailwind class names** — only add new ones, don't remove working styles
- **Keep Next.js `<Image>` component** — don't replace with `<img>` tags
- **Maintain TypeScript types** — all fixes must be type-safe
- **Test mentally for mobile (375px)** — every fix must work at mobile viewport width
- **One primary CTA per screen** — don't add additional CTAs that compete with existing ones
- **Maintain the existing component API** — don't add required props that would break existing usages

---

## PRIORITY ORDER

Fix in this order (most critical to least):

1. **Issues 1, 2, 4** — Mobile nav gap, iOS input zoom, skip link (Critical UX/accessibility)
2. **Issues 5, 6** — Button hover states, prefers-reduced-motion (Interaction quality)
3. **Issues 7, 8, 11, 12** — autocomplete, aria-expanded, aria-current, aria-label (Accessibility)
4. **Issues 9, 10** — Mobile label size, nav aria-label (Minor accessibility)
5. **Issues 13, 18** — Preconnect, fetchpriority (Performance)
6. **Issues 3, 14, 15, 16, 17** — Form layout, footer, placeholder, label IDs, alert roles (UX Polish)
7. **Issue 19, 20** — Dark mode aria, font opinion (Nice to have)

---

*This prompt was generated based on a full code audit of the SCNavi repository against The Complete Web Design Playbook best practices guide.*
