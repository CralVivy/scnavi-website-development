<div align="center">

# 🧭 SCNavi

### Smart Campus Navigation System for Bicol University

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

[![License](https://img.shields.io/badge/License-Apache_2.0-D22128?style=for-the-badge)](./LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-API-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)](https://developers.google.com/maps)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

&nbsp;

**SCNavi** is a full-stack smart campus navigation web application that helps Bicol University students find classrooms, manage schedules, avoid conflicts, and stay updated with real-time campus events — powered by AI and interactive maps.

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [Environment Setup](#-environment-variables) · [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎓 Student Portal

| Feature | Description |
|:---|:---|
| **Smart Dashboard** | Personalized home with next-class countdown, daily schedule overview, quick campus map, and a feedback form. |
| **AI Schedule Parser** | Upload your Certificate of Registration (COR) image and Gemini 2.5 Flash extracts your full semester schedule automatically. |
| **Interactive Campus Map** | Google Maps integration with building markers, room status indicators (available/occupied/maintenance), and a searchable list view. |
| **Schedule Views** | Toggle between **Today**, **Weekly**, and **Overview** layouts with color-coded subject cards and time-aware highlights. |
| **Campus Events** | Browse upcoming university events filtered by category (Academic, Sports, Cultural, etc.) with date and location info. |
| **Profile & Settings** | Manage personal info, toggle push notifications, alert preferences, and switch between light/dark themes. |
| **Real-time Notifications** | Receive browser push alerts for upcoming classes (30-min warning) and admin announcements via Firestore listeners. |

### 🛡️ Admin Portal

| Feature | Description |
|:---|:---|
| **Admin Dashboard** | At-a-glance statistics for total students, rooms, active events, and recent feedback submissions. |
| **Conflict Detection** | Automated scheduling scans that identify room double-bookings and overlapping instructor assignments. |
| **Room Management** | Interactive map editor for adding, editing, and removing campus building markers with metadata. |
| **Floor Plan Builder** | Visual drag-and-drop canvas for designing building floor plans with room polygons and labels. |
| **Class Schedule Viewer** | Browse all student-uploaded schedules grouped by course, with per-day and per-student breakdowns. |
| **Event Management** | Create, edit, and publish campus events with category tags, dates, and location details. |
| **Feedback & Ratings** | Review student feedback submissions with filter tabs (All / Pending / Reviewed). |
| **Push Notifications** | Send targeted notifications to individual students or broadcast announcements campus-wide. |
| **User Management** | View all registered users and promote/demote roles via Firebase Custom Claims (zero-read admin check). |

### 🌗 System-wide

| Feature | Description |
|:---|:---|
| **Dark Mode** | Full semantic token-based dark theme with `@custom-variant` (Tailwind v4). Persists across sessions via `localStorage`. |
| **Persistent Auth** | Firebase `browserLocalPersistence` keeps users signed in. Landing page dynamically adapts UI for authenticated visitors. |
| **Role-based Routing** | Logged-in users are routed to their correct portal (`/dashboard` for students, `/admin/dashboard` for admins). |
| **Responsive Design** | Mobile-first layouts with collapsible sidebars, bottom navigation bar, and adaptive grids. |
| **BU Email Restriction** | Only `@bicol-u.edu.ph` email addresses are allowed during registration and login (Email + Google OAuth). |

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client — Next.js 16 (Turbopack)"]
        LP["Landing Page<br/><small>Server Component</small>"]
        SA["Student Portal<br/><small>Client Components</small>"]
        AA["Admin Portal<br/><small>Client Components</small>"]
        CI["Component Islands<br/><small>LandingHeaderAuth, LandingHeroCTA</small>"]
    end

    subgraph API["⚡ API Routes — Next.js"]
        PC["POST /api/parse-cor<br/><small>Gemini 2.5 Flash</small>"]
        PR["POST /api/admin/promote<br/><small>Firebase Admin SDK</small>"]
        CD["POST /api/admin/conflicts<br/><small>Schedule Scanner</small>"]
    end

    subgraph Firebase["🔥 Firebase"]
        AU["Authentication<br/><small>Email + Google OAuth</small>"]
        FS["Cloud Firestore<br/><small>Users, Schedules, Events,<br/>Notifications, Feedback, Buildings</small>"]
        CC["Custom Claims<br/><small>admin: true</small>"]
    end

    subgraph External["🌐 External APIs"]
        GM["Google Maps<br/><small>@vis.gl/react-google-maps</small>"]
        GE["Google Gemini<br/><small>@google/genai</small>"]
    end

    Client -->|Auth State| AU
    Client -->|Read/Write| FS
    SA --> PC
    AA --> PR
    AA --> CD
    PC --> GE
    PR --> CC
    SA --> GM
    AA --> GM
```

---

## 📁 Project Structure

```
SCNavi-Website/
├── LICENSE                          # Apache 2.0
├── README.md                        # ← You are here
├── website-references/              # Design references & mockups
└── scnavi-web/                      # Next.js application root
    ├── public/
    │   └── images/                  # Static assets (campus bg, etc.)
    ├── src/
    │   ├── app/
    │   │   ├── globals.css          # Design system tokens + dark mode
    │   │   ├── layout.tsx           # Root layout (fonts, ThemeProvider)
    │   │   ├── page.tsx             # Landing page (Server Component)
    │   │   ├── login/               # Student login
    │   │   ├── register/            # Student registration
    │   │   ├── (student)/           # Student portal (route group)
    │   │   │   ├── layout.tsx       # Sidebar + mobile nav + auth guard
    │   │   │   ├── dashboard/       # Home dashboard
    │   │   │   ├── map/             # Interactive campus map
    │   │   │   ├── schedule/        # AI-powered schedule viewer
    │   │   │   ├── events/          # Campus events browser
    │   │   │   └── profile/         # Profile & settings
    │   │   ├── admin/
    │   │   │   ├── login/           # Admin login
    │   │   │   └── (protected)/     # Auth-guarded admin pages
    │   │   │       ├── layout.tsx   # Admin sidebar + auth guard
    │   │   │       ├── dashboard/   # Admin overview
    │   │   │       ├── conflicts/   # Conflict detection
    │   │   │       ├── rooms/       # Map-based room editor
    │   │   │       ├── floorplan/   # Floor plan builder
    │   │   │       ├── schedules/   # View all student schedules
    │   │   │       ├── events/      # Manage campus events
    │   │   │       ├── feedback/    # Student feedback review
    │   │   │       ├── notifications/ # Send push notifications
    │   │   │       └── users/       # User role management
    │   │   └── api/
    │   │       ├── parse-cor/       # Gemini AI schedule extraction
    │   │       └── admin/
    │   │           ├── promote/     # Role promotion endpoint
    │   │           └── conflicts/   # Conflict detection engine
    │   ├── components/
    │   │   ├── layout/              # Navigation & layout components
    │   │   │   ├── StudentNav.tsx   # Student sidebar + mobile nav
    │   │   │   ├── AdminSidebar.tsx # Admin sidebar
    │   │   │   ├── LandingHeaderAuth.tsx  # Auth-aware header (Client Island)
    │   │   │   └── LandingHeroCTA.tsx     # Dynamic CTA (Client Island)
    │   │   ├── map/                 # Google Maps components
    │   │   └── ui/                  # Reusable UI primitives
    │   │       ├── Button.tsx       # Variant-based button
    │   │       ├── Card.tsx         # Surface card container
    │   │       ├── Input.tsx        # Form input with label
    │   │       ├── FloorPlanCanvas.tsx  # Interactive canvas editor
    │   │       └── ThemeSettings.tsx    # Theme toggle controls
    │   └── lib/
    │       ├── firebase.ts          # Client-side Firebase init
    │       ├── firebaseAdmin.ts     # Server-side Firebase Admin init
    │       ├── ThemeContext.tsx      # Dark mode context provider
    │       ├── useAuthSession.ts    # Auth + Firestore profile hook
    │       └── scheduleColors.ts    # Color assignment for subjects
    ├── firestore.rules               # Firestore security rules
    ├── package.json
    ├── tsconfig.json
    ├── postcss.config.mjs
    └── next.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|:---|:---|:---|
| **Node.js** | `≥ 18.17` | JavaScript runtime |
| **npm** | `≥ 9` | Package manager (bundled with Node) |
| **Git** | Latest | Version control |

You will also need accounts for:
- [Firebase Console](https://console.firebase.google.com/) — Authentication, Firestore, Admin SDK
- [Google Cloud Console](https://console.cloud.google.com/) — Maps JavaScript API, Gemini API
- [Vercel](https://vercel.com/) *(optional)* — Deployment

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/CralVivy/scnavi-website-development.git
cd scnavi-website-development

# 2. Navigate to the app directory
cd scnavi-web

# 3. Install dependencies
npm install

# 4. Set up environment variables (see section below)
cp .env.local.example .env.local
# Then fill in your Firebase and API keys

# 5. Start the development server
npm run dev
```

The app will be available at **`http://localhost:3000`**.

---

## 🔐 Environment Variables

Create a `.env.local` file inside `scnavi-web/` with the following keys:

<details>
<summary><strong>📋 Click to expand full <code>.env.local</code> template</strong></summary>

```env
# ──────────────────────────────────────────────
# Firebase Client SDK (public, safe for browser)
# ──────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ──────────────────────────────────────────────
# Firebase Admin SDK (server-side only, PRIVATE)
# ──────────────────────────────────────────────
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ──────────────────────────────────────────────
# Google APIs
# ──────────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
```

</details>

> [!IMPORTANT]
> **Never commit `.env.local` to version control.** It is already listed in `.gitignore`. The `FIREBASE_PRIVATE_KEY` value must include the literal `\n` newline escapes wrapped in double quotes.

### Where to find each key

| Variable | Source |
|:---|:---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Console → Project Settings → General → Your Apps → Web App config |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate New Private Key (JSON → `client_email`) |
| `FIREBASE_PRIVATE_KEY` | Same JSON file → `private_key` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services → Credentials → API Key (enable Maps JavaScript API) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) → Create API Key |

---

## 🔥 Firebase Setup

<details>
<summary><strong>1. Enable Authentication Providers</strong></summary>

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Enable **Google** (set support email)
4. Under **Settings** → **Authorized domains**, add your Vercel deployment URL

</details>

<details>
<summary><strong>2. Create Firestore Database</strong></summary>

1. Go to **Firebase Console** → **Firestore Database** → **Create database**
2. Start in **production mode**
3. Deploy the security rules from [`firestore.rules`](./scnavi-web/firestore.rules):

```bash
# If using Firebase CLI
firebase deploy --only firestore:rules
```

Or manually paste the rules into **Firestore** → **Rules** tab.

</details>

<details>
<summary><strong>3. Set Up the First Admin</strong></summary>

The first admin must be bootstrapped manually since the promote API requires an existing admin:

1. Create a student account via the registration page
2. Open your Firebase Console → **Firestore** → `users` collection
3. Find the user document and change the `role` field from `"student"` to `"admin"`
4. In the Firebase Console → **Authentication** → click the user → **Custom Claims**, set:
   ```json
   { "admin": true }
   ```
   *(Or use the Firebase Admin SDK in a one-off script)*

After this, the admin can promote other users through the **User Management** page in the Admin Portal.

</details>

---

## 🧰 Tech Stack

<table>
<tr>
<td align="center" width="120"><strong>Layer</strong></td>
<td><strong>Technology</strong></td>
</tr>
<tr>
<td align="center">Framework</td>
<td><strong>Next.js 16.2</strong> with Turbopack — App Router, Server/Client Components, API Routes</td>
</tr>
<tr>
<td align="center">UI</td>
<td><strong>React 19</strong> — Concurrent features, Server Components, Component Islands architecture</td>
</tr>
<tr>
<td align="center">Styling</td>
<td><strong>Tailwind CSS 4</strong> — CSS-first config, <code>@theme inline</code>, <code>@custom-variant</code>, semantic design tokens</td>
</tr>
<tr>
<td align="center">Language</td>
<td><strong>TypeScript 5</strong> — Strict mode, type-safe Firebase queries, interface-driven components</td>
</tr>
<tr>
<td align="center">Auth</td>
<td><strong>Firebase Auth</strong> — Email/Password + Google OAuth, Custom Claims for RBAC</td>
</tr>
<tr>
<td align="center">Database</td>
<td><strong>Cloud Firestore</strong> — Real-time listeners, security rules with zero-read admin checks</td>
</tr>
<tr>
<td align="center">Server</td>
<td><strong>Firebase Admin SDK</strong> — Custom Claims management, server-side token verification</td>
</tr>
<tr>
<td align="center">Maps</td>
<td><strong>Google Maps JavaScript API</strong> via <code>@vis.gl/react-google-maps</code></td>
</tr>
<tr>
<td align="center">AI</td>
<td><strong>Google Gemini 2.5 Flash</strong> via <code>@google/genai</code> — Schedule extraction from COR images</td>
</tr>
<tr>
<td align="center">Date/Time</td>
<td><strong>date-fns 4</strong> — Time parsing, class countdowns, schedule comparisons</td>
</tr>
<tr>
<td align="center">Deploy</td>
<td><strong>Vercel</strong> — Auto-deploys from GitHub, serverless API routes, edge network</td>
</tr>
</table>

---

## 🎨 Design System

SCNavi uses a **semantic token-based design system** defined entirely in CSS. All colors resolve through CSS custom properties, enabling seamless dark mode toggling.

```css
/* Light Theme (default) */
--color-primary:                 #0A84FF    /* Interactive elements */
--color-accent:                  #FF9500    /* Highlights & CTAs */
--color-surface:                 #f9f9fb    /* Page backgrounds */
--color-surface-container-lowest: #ffffff   /* Cards & elevated surfaces */
--color-on-surface:              #1a1c1d    /* Primary text */
--color-on-surface-variant:      #414754    /* Secondary text */
--color-outline:                 #717786    /* Tertiary text & borders */

/* Dark Theme (.dark class on <html>) */
--color-surface:                 #111318
--color-surface-container-lowest: #0c0e13
--color-on-surface:              #e2e2e9
```

**Fonts:** [Inter](https://rsms.me/inter/) (UI) + [Newsreader](https://fonts.google.com/specimen/Newsreader) (Headlines)

---

## 📜 Available Scripts

Run these from the `scnavi-web/` directory:

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server with Turbopack HMR |
| `npm run build` | Create optimized production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## 🌍 Deployment

SCNavi is configured for deployment on **Vercel**:

1. Push your code to GitHub
2. Import the repository in [Vercel Dashboard](https://vercel.com/new)
3. Set the **Root Directory** to `scnavi-web`
4. Add all environment variables from your `.env.local` to Vercel's **Environment Variables** settings
5. Deploy — Vercel auto-detects Next.js and configures the build

> [!TIP]
> Vercel automatically redeploys on every push to your `main` branch. Preview deployments are created for pull requests.

---

## 🔒 Security

- **Firestore Rules** enforce authentication and role-based access at the database level
- **Custom Claims** (`admin: true`) are set on Firebase Auth tokens for zero-read admin verification — no Firestore document lookups needed for permission checks
- **API Route Protection** — Server-side endpoints verify the `Authorization: Bearer <token>` header and validate admin claims before processing
- **Domain Restriction** — Only `@bicol-u.edu.ph` email addresses can register or sign in
- **Environment Isolation** — All secrets (`FIREBASE_PRIVATE_KEY`, `GEMINI_API_KEY`) are server-only and never exposed to the client bundle

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature`
5. **Open** a Pull Request

Please follow the existing code style and use semantic commit messages.

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](./LICENSE) file for details.

```
Copyright 2026 Cral

Licensed under the Apache License, Version 2.0
```

---

<div align="center">

**Built with ❤️ by [Blockers United](https://github.com/CralVivy) for Bicol University**

<sub>SCNavi — Smart Campus Navigation System · Bicol University · 2026</sub>

</div>
