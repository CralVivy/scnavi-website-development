# SCNavi Website - Phase 3 (Refinement & Firebase Verification)

Based on your feedback, we will adjust the landing page to a "light aesthetic" (similar to modern all-white SaaS pages) and clarify how to verify the Firebase connection.

## 1. Firebase Verification

**Why is it blank?**
If you are looking at Firebase Analytics (Daily Active Users), it usually takes 24 hours for Google Analytics data to populate. 
However, **Firebase Authentication and Firestore are working in real-time.** 

**How to verify it works right now:**
1. Open the SCNavi web app at `http://localhost:3000/register`.
2. Fill out the form and click "Register".
3. Immediately go to your Firebase Console and check two places:
   * **Authentication Tab:** You will see the new user's email registered.
   * **Firestore Database Tab:** You will see a new `users` collection containing the user's name, course, and role.

*(Note: The Admin Dashboard inside the app currently uses mock static numbers for conflicts/users to establish the layout. In future phases, we will wire those specific dashboard numbers to read live from Firestore).*

## 2. Landing Page Redesign (Light Aesthetic)

We will remove the dark overlay and transition the hero section to a vibrant, light SaaS theme.

**Proposed Changes (`src/app/page.tsx`):**
1.  **Background Overlay:** Replace the heavy dark Slate gradient with a light, semi-transparent white wash (e.g., `bg-white/80` or a gradient fading from pure white at the top to `white/60` at the bottom). This keeps the background image visible but ensures a bright, airy feel.
2.  **Glassmorphism Container:** Update the container to a bright frosted glass (`bg-white/70 backdrop-blur-xl border-white/50 shadow-2xl`).
3.  **Headline Typography & Colors:** 
    *   Change the main headline text from white to dark slate (`text-on-surface`).
    *   Apply the requested color scheme to make it pop: Make "Navigate Your Campus" Campus Blue (`#0A84FF`) and "With Intelligence." Campus Orange (`#FF9500`).
4.  **"Introducing SCNavi..." Badge:** Change this badge to utilize a soft orange background (`bg-accent/10`) with vibrant Orange and Blue text to match the new color scheme.
5.  **Subtext:** Change the description text to a readable dark gray (`text-on-surface-variant`).

## 3. Open Questions / User Review Required

> [!TIP]
> This light aesthetic will heavily mimic the clean, white interfaces seen on Semrush and Todoist, using the background image purely as a subtle, premium texture behind the vibrant text.

Do you approve this redesign plan? If so, I will immediately execute the changes to `src/app/page.tsx`!
