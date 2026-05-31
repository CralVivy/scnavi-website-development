# The Complete Web Design Playbook
### UI, UX, Responsive Design & Prompt Templates for Implementation

---

## TABLE OF CONTENTS

1. [Foundation & Strategy](#1-foundation--strategy)
2. [Visual Design & UI](#2-visual-design--ui)
3. [Typography](#3-typography)
4. [Color Theory & Palettes](#4-color-theory--palettes)
5. [Layout & Spacing Systems](#5-layout--spacing-systems)
6. [UX & Interaction Design](#6-ux--interaction-design)
7. [Navigation Patterns](#7-navigation-patterns)
8. [Accessibility (WCAG)](#8-accessibility-wcag)
9. [Responsive Design: Desktop & Mobile](#9-responsive-design-desktop--mobile)
10. [Performance & Core Web Vitals](#10-performance--core-web-vitals)
11. [Forms, Inputs & Feedback](#11-forms-inputs--feedback)
12. [Content Strategy](#12-content-strategy)
13. [Imagery & Media](#13-imagery--media)
14. [Motion & Micro-interactions](#14-motion--micro-interactions)
15. [Common Mistakes to Avoid](#15-common-mistakes-to-avoid)
16. [Master Prompt Templates for Antigravity](#16-master-prompt-templates-for-antigravity)

---

## 1. FOUNDATION & STRATEGY

Every exceptional website starts with a clear foundation before a single pixel is designed.

### Define Purpose & Goals
- **Primary goal**: What do you want users to DO? (Buy, sign up, read, contact, learn)
- **Secondary goals**: Secondary conversions or engagement points
- **Business metric**: What defines success? (Conversion rate, time on site, bounce rate)
- **Brand voice**: Formal, playful, authoritative, minimal, warm?

### Know Your Audience
- **User personas**: Age, device habits, technical literacy, goals, pain points
- **User intent**: Are they browsing, comparing, or ready to convert?
- **Context of use**: At a desk with focus? On mobile with one hand while commuting?

### Information Architecture (IA)
- Map out every page and how they connect before designing
- Use card sorting mentally: group related content the way USERS think, not the way your org chart looks
- Limit top-level navigation to **5–7 items max** (Miller's Law)
- Every page should answer: *Where am I? What can I do here? Where can I go next?*

### The "3-Click Rule" (Updated Thinking)
While the old "3 clicks" rule is oversimplified, the real principle is: **minimize cognitive load per step**, not steps themselves. A user who takes 6 easy, obvious clicks is happier than one forced through 2 confusing ones.

---

## 2. VISUAL DESIGN & UI

### Visual Hierarchy — The Most Important Principle
Visual hierarchy tells users where to look first, second, and third. Achieve it through:

- **Size**: Bigger = more important. Headlines dominate; body text supports.
- **Weight**: Bold draws the eye. Use it sparingly or it loses meaning.
- **Color**: Saturated or high-contrast elements attract attention. Muted elements recede.
- **Position**: Top-left to bottom-right (in LTR languages) is the natural reading path (F-pattern or Z-pattern depending on content density).
- **Whitespace**: Empty space around an element makes it feel important. Don't fear it.
- **Contrast**: The element with the highest contrast ratio on a page is what the eye lands on first.

### The F-Pattern & Z-Pattern
- **F-Pattern**: Used when users are scanning content-heavy pages (blogs, news, dashboards). Users read the top, then scan left margins.
- **Z-Pattern**: Used for sparser layouts (landing pages, homepages). Users scan top-left → top-right → diagonal → bottom-left → bottom-right.
- **Design tip**: Place your most critical CTAs (Call to Actions) at Z-pattern terminal points.

### The Golden Ratio & Rule of Thirds
- The **Golden Ratio (1:1.618)** can guide proportions: sidebar widths, image crops, spacing ratios.
- The **Rule of Thirds**: Divide your canvas into a 3×3 grid. Place focal points at intersections.
- These aren't rules — they're tools for making proportions feel natural.

### Gestalt Principles (Critical for UI)
1. **Proximity**: Elements close together are perceived as related. Group related controls, labels near their inputs, and related navigation items.
2. **Similarity**: Elements that look alike are perceived as belonging to the same group. Consistent button styles signal consistent actions.
3. **Continuity**: The eye follows lines and curves. Use alignment to guide attention.
4. **Closure**: The mind completes incomplete shapes. Use this for elegant icon design or implied containers.
5. **Figure/Ground**: Users separate foreground from background. Sufficient contrast is non-negotiable.
6. **Common Fate**: Elements moving together are perceived as related. Use in animations.

### Component Consistency
Every interactive element should have states:
- **Default**: How it looks at rest
- **Hover**: Subtle visual feedback that it's interactive (cursor change + visual change)
- **Active/Pressed**: Feedback during interaction (slight depression, color shift)
- **Focus**: Critical for keyboard/screen reader users — a visible focus ring
- **Disabled**: Visually distinct, non-interactive, low contrast
- **Loading**: Skeleton screens or spinners when data is fetching
- **Error**: Clear, red-toned, with explanatory text
- **Success**: Green-toned, positive confirmation

---

## 3. TYPOGRAPHY

Typography is 95% of web design. Get it right and everything else follows.

### Type Scale
Use a modular scale — a consistent ratio applied to a base size:
- **Base size**: 16px (the browser default — never go below 16px for body text)
- **Common ratios**: Major Third (1.25), Perfect Fourth (1.333), Golden Ratio (1.618)
- **Example scale (Perfect Fourth)**: 10 / 13 / 16 / 21 / 28 / 37 / 49 / 65px

### Font Pairing Rules
- **Max 2–3 typefaces** per project. More creates visual noise.
- Pair a distinctive **display font** (headings) with a highly **readable body font**
- Contrast personalities: geometric sans-serif + humanist serif, or slab serif + grotesque
- Avoid pairing two fonts with similar personalities — they'll clash without contrast

### Readability Rules (Critical)
- **Line length**: 45–75 characters per line (about 600–700px wide for 16px text). Too wide = eyes lose their place. Too narrow = choppy reading.
- **Line height (leading)**: 1.4–1.7× the font size for body text. Headlines can go tighter: 1.1–1.3×
- **Letter spacing (tracking)**: Body text: 0 to -0.01em. ALL CAPS text: +0.05–0.15em to improve readability.
- **Paragraph spacing**: 0.75–1× the line height between paragraphs
- **Font weight for body**: 400 (Regular). Use 300 (Light) only on large, dark-background text at large sizes.
- **Never use pure black (#000000) on white**: Use #1a1a1a or #111827 — softer on the eyes.

### Heading Hierarchy
```
H1: 1 per page. The page's main topic. (48–72px display)
H2: Major sections. (32–40px)
H3: Subsections. (24–28px)
H4: Minor groupings. (18–20px)
Body: 16–18px
Caption/Small: 12–14px (never below 12px)
```

### Web Font Performance
- Limit to **2 font families**, **2–3 weights each**
- Use `font-display: swap` to prevent invisible text during load
- Subset fonts when possible (Latin only if you don't need extended characters)
- Consider system font stacks for utilitarian interfaces where brand expression matters less

---

## 4. COLOR THEORY & PALETTES

### The 60-30-10 Rule
- **60%**: Dominant/neutral color (backgrounds, large surfaces)
- **30%**: Secondary color (cards, sidebars, secondary UI)
- **10%**: Accent color (CTAs, highlights, interactive states)

### Building a Color System
Define at minimum:
- **Primary**: Brand color — used for primary actions (buttons, links, highlights)
- **Secondary**: Complements primary — used for secondary elements
- **Neutrals**: A grayscale ramp (5–10 shades from near-white to near-black) for text, backgrounds, borders
- **Semantic colors**:
  - Success: Green (#22c55e range)
  - Warning: Amber (#f59e0b range)
  - Error: Red (#ef4444 range)
  - Info: Blue (#3b82f6 range)

### Contrast Requirements (WCAG)
- **Normal text (under 18pt)**: Minimum 4.5:1 contrast ratio against background (AA), 7:1 for AAA
- **Large text (18pt+ or bold 14pt+)**: Minimum 3:1 (AA)
- **UI components & focus indicators**: Minimum 3:1 against adjacent colors
- **Tool**: Use WebAIM Contrast Checker or browser DevTools accessibility panel

### Color Psychology (use intentionally, not blindly)
- **Blue**: Trust, reliability, calm — widely used in finance, tech, healthcare
- **Green**: Growth, nature, success, go — ideal for eco, finance success states, health
- **Red**: Urgency, danger, passion — use sparingly; naturally draws the eye
- **Yellow/Amber**: Optimism, caution, warmth — great for highlights, warnings
- **Purple**: Creativity, luxury, mystery — tech/AI brands, premium products
- **Black/Dark**: Sophistication, power, premium — fashion, luxury, high-end tech
- **White/Light**: Cleanliness, simplicity, space — healthcare, minimal tech, editorial

### Dark Mode Considerations
- Don't just invert colors — dark mode needs its own palette
- Background: Use very dark grays (#0f172a, #1e293b) rather than pure black
- Reduce saturation on colored elements (they appear more vivid on dark backgrounds)
- Shadows don't work the same — use lighter, glowing borders or elevation via brightness instead
- Provide a system preference toggle AND respect `prefers-color-scheme` CSS media query

---

## 5. LAYOUT & SPACING SYSTEMS

### The 8-Point Grid System
The single most effective layout discipline:
- All spacing values are **multiples of 8px**: 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128
- Elements snap to this grid — layouts feel cohesive and intentional
- Use 4px for micro-spacing (icon padding, tight label gaps)
- Use 8–16px for intra-component spacing
- Use 32–64px for section separations
- Use 80–128px+ for major page section breathing room

### CSS Grid vs Flexbox
- **Flexbox**: One-dimensional layouts. Navigation bars, card rows, centered content, aligning items in a line.
- **CSS Grid**: Two-dimensional layouts. Page structure, complex card grids, overlapping elements.
- Use Grid for the macro layout (page structure) and Flexbox for micro layouts (component internals).

### Max-Width & Containers
- **Content max-width**: 1200–1440px for most sites (prevents lines from being too wide on large monitors)
- **Text content max-width**: 680–760px (optimal line length)
- **Padding**: Always apply horizontal padding on containers so content doesn't touch viewport edges: `padding: 0 clamp(16px, 5vw, 80px)`
- **Never full-bleed text** — always a container with meaningful margins

### Whitespace as a Design Element
- Whitespace is not "wasted space" — it creates breathing room, focus, and perceived quality
- Increase whitespace between sections to make a design feel more premium
- Tight, dense layouts signal utility/data tools; generous whitespace signals luxury/brand
- **Padding inside cards**: Minimum 24px; ideally 32–40px for prominent cards

---

## 6. UX & INTERACTION DESIGN

### Fitts's Law
The time to click a target is based on its **size** and **distance**. Implications:
- Make buttons big enough (minimum 44×44px touch target, ideally 48×48px)
- Place frequent actions where they're easiest to reach (bottom of screen on mobile)
- Keep related actions close together

### Hick's Law
The time to make a decision increases with the number of choices. Implications:
- Limit navigation items to 5–7
- Break long forms into steps
- Prioritize one primary CTA per screen

### Miller's Law
Working memory holds 7 (±2) items. Implications:
- Group navigation into logical chunks
- Break content into scannable sections with clear headings
- Use progressive disclosure — reveal complexity only when needed

### Jakob's Law
Users spend most of their time on OTHER websites. They expect your site to work like sites they already know. Implications:
- Logo top-left, links top-right/hamburger mobile is convention for a reason
- Don't reinvent navigation without a compelling reason
- Use established patterns for forms, carts, modals, accordions

### Progressive Disclosure
- Show the minimum needed information; reveal more when the user requests it
- Examples: "Read more" expanders, tooltips, accordions, drawer menus, hover states
- Reduces cognitive load on first impression

### Feedback & System Status (Nielsen's #1 Heuristic)
Users need to know what's happening:
- Button clicks → visual feedback (active state, loading state)
- Form submission → success or error message
- Long operations → progress bar or animated indicator
- Empty states → explain what should be here and how to add content

### Error Prevention Over Error Recovery
Design to prevent mistakes before they happen:
- Confirm destructive actions ("Are you sure you want to delete?")
- Inline validation on forms (before submit)
- Disable submit until required fields are complete
- Clear, unambiguous labels and placeholder text

### Affordances
Every interactive element must **look** interactive:
- Buttons look pressable (rounded corners, shadow or color fill, hover state)
- Links are underlined or distinctly colored
- Draggable items have grab cursors and visual handles
- Form inputs have visible borders/backgrounds that differ from static text

---

## 7. NAVIGATION PATTERNS

### Desktop Navigation
- **Primary nav**: Horizontal top bar. Logo left, links right, CTA button far right.
- **Mega menu**: For sites with deep hierarchies (e-commerce, enterprise). On hover: multi-column dropdown. Include images/icons for wayfinding.
- **Sticky nav**: Stays at top while scrolling. Essential for long pages. Add a subtle background/shadow on scroll so it separates from content.
- **Breadcrumbs**: Required for sites with 3+ levels of depth (e-commerce, documentation, government).

### Mobile Navigation
- **Hamburger menu**: Standard. Place it top-right (right-hand thumb territory). Always include a visible "×" to close.
- **Bottom tab bar**: Better UX for apps and frequently used sections. Thumb-friendly, always visible. Use for 3–5 primary destinations.
- **Drawer/Slide-over**: Full-height side panel. Good for complex nested navigation.
- **Priority+**: Show the most important links inline; overflow to "More" — best of both worlds for medium screens.

### Navigation Rules
- Highlight the **active/current page** in navigation — always
- Use **aria-current="page"** for screen readers on active nav items
- Navigation links should be descriptive nouns, not verbs (except CTAs)
- Never hide navigation entirely on desktop — it must be reachable without interaction
- **Back button compatibility**: Never use JS to prevent default browser back behavior

### Footer Navigation
- The footer is a second chance for navigation — include all major links
- Essential footer elements: Logo, nav links, legal (Privacy, Terms), social icons, contact
- Consider a **mini sitemap** in the footer for large sites
- Newsletter signup in footer converts well when the main CTA is elsewhere

---

## 8. ACCESSIBILITY (WCAG)

Accessibility is not optional — it's ethical, legal, and improves UX for everyone.

### The WCAG 4 Principles (POUR)
1. **Perceivable**: Information must be presentable to all users (alt text, captions, color contrast)
2. **Operable**: All functionality must be accessible via keyboard (no mouse-only interactions)
3. **Understandable**: Content and UI must be clear (plain language, consistent navigation)
4. **Robust**: Content must work with current and future assistive technologies

### Critical Accessibility Checklist

**Semantic HTML**
- Use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
- Use heading tags (`<h1>`–`<h6>`) for structure, not styling
- Use `<button>` for actions, `<a>` for navigation — never `<div onClick>`
- Use `<label for="...">` on all form inputs, never rely on placeholder text alone

**Images**
- All meaningful images: `alt="descriptive text"`
- Decorative images: `alt=""` (empty, so screen readers skip them)
- Complex images (charts): Provide a text description below or via `aria-describedby`

**Keyboard Navigation**
- Tab key must reach every interactive element in logical order
- Enter/Space must activate buttons and links
- Escape must close modals and dropdowns
- Visible focus indicator must be present (never `outline: none` without a replacement)
- **Focus trap in modals**: When a modal is open, Tab must cycle within it, not the background

**ARIA (when HTML semantics aren't enough)**
- `aria-label`: Adds a text label to elements that don't have visible text
- `aria-expanded="true/false"`: On hamburger buttons and accordions
- `aria-live="polite"`: Announces dynamic content changes to screen readers
- `role="dialog"` + `aria-modal="true"`: On modal overlays
- Never use ARIA to override correct HTML semantics — fix the HTML first

**Color & Contrast**
- Never use color alone to convey information (always add icon or text)
- All text meets 4.5:1 contrast minimum (use Stark plugin or WebAIM Checker)
- Focus rings: 3:1 contrast ratio minimum

**Motion & Animation**
- Respect `prefers-reduced-motion` CSS media query
- Never auto-play video with sound
- Avoid flashing content (>3 flashes/sec can trigger seizures — WCAG 2.3.1)

---

## 9. RESPONSIVE DESIGN: DESKTOP & MOBILE

### The Mobile-First Philosophy
Design and code for the smallest screen first, then progressively enhance for larger screens. Why:
- Forces prioritization of essential content
- Better performance (load mobile CSS, add desktop CSS progressively)
- Aligns with how users actually behave (60%+ web traffic is mobile)

### Breakpoints Reference
```
Mobile portrait:  320px – 480px  (small phones)
Mobile landscape: 481px – 768px  (large phones, small tablets)
Tablet portrait:  769px – 1024px (tablets, small laptops)
Desktop:          1025px – 1280px
Wide desktop:     1281px – 1440px
Ultra-wide:       1440px+

Common breakpoints to code:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
```

### Layout Transformation Patterns

**Stack on Mobile, Side-by-Side on Desktop**
```
Mobile: Single column, full-width sections, stacked vertically
Tablet: 2-column grids, sidebar + content
Desktop: 3–4 column grids, complex multi-column layouts
```

**Navigation Transformation**
```
Mobile: Hamburger menu → full-screen or drawer overlay
Tablet: Condensed horizontal nav or hamburger
Desktop: Full horizontal nav with all links visible
```

**Image Handling**
```
Mobile: Full-width images, cropped/reframed for vertical
Tablet: 50% wide with text alongside
Desktop: Fixed dimensions, hero imagery, background fills
```

### CSS Techniques for Responsiveness

**Fluid Typography (Recommended)**
```css
/* Scales smoothly between viewport sizes — no jarring jumps */
font-size: clamp(1rem, 2.5vw, 1.5rem);

/* Or with a full scale */
--step-0: clamp(1rem, 0.91rem + 0.43vw, 1.25rem);
--step-1: clamp(1.25rem, 1.08rem + 0.87vw, 1.75rem);
--step-2: clamp(1.5rem, 1.27rem + 1.17vw, 2.25rem);
```

**Fluid Spacing**
```css
padding: clamp(1rem, 5vw, 3rem);
gap: clamp(1rem, 3vw, 2rem);
```

**Intrinsic Responsive Grids (No Media Queries Needed)**
```css
/* Cards that auto-fill based on available space */
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1.5rem;
```

**Container Queries (Modern CSS — Use Now)**
```css
/* Component reflows based on its CONTAINER width, not viewport */
@container (min-width: 500px) {
  .card { flex-direction: row; }
}
```

### Touch Target Rules (Mobile)
- Minimum touch target: **44×44px** (Apple HIG), ideally **48×48px** (Material Design)
- Minimum spacing between touch targets: **8px**
- Place frequent actions in the **bottom half of the screen** (thumb zone)
- Top corners are hardest to reach — avoid critical actions there on mobile

### Mobile-Specific UX Rules
- **No hover-dependent content**: Touch devices don't hover. All hover-only tooltips or menus must have a tap equivalent.
- **Input types matter**: Use `type="email"`, `type="tel"`, `type="number"` to trigger the correct mobile keyboard
- **Tap highlight**: Remove the default blue tap highlight with `tap-highlight-color: transparent` but replace it with a visible pressed state
- **Scroll performance**: Use `overflow-y: auto` with `-webkit-overflow-scrolling: touch` in scroll containers
- **Avoid fixed positioning abuses**: Fixed elements can interfere with mobile viewport changes (especially with virtual keyboard)
- **Form UX on mobile**: 
  - Full-width inputs
  - Large tap targets for fields (height: 48px minimum)
  - Proper input types for mobile keyboards
  - Auto-capitalize and auto-correct settings per field (`autocapitalize`, `autocorrect`, `autocomplete`)

### Viewport Meta Tag (Required)
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Never use `maximum-scale=1` or `user-scalable=no` — this prevents users from zooming (accessibility violation).

### Testing Responsiveness
- Chrome DevTools Device Mode: Simulate viewports
- Real device testing: iOS Safari and Android Chrome behave differently from Chrome DevTools
- Test in **landscape AND portrait** on mobile
- Test with **system font size increased** (accessibility testing)
- Test with **keyboard open** on mobile (reduces viewport height significantly)

---

## 10. PERFORMANCE & CORE WEB VITALS

Performance IS user experience. A 1-second delay in load time reduces conversions by 7%.

### The Core Web Vitals (Google's UX Metrics)

**LCP — Largest Contentful Paint** (Loading)
- Measures when the largest visible element loads
- **Target**: Under 2.5 seconds
- How to improve:
  - `<link rel="preload">` your hero image
  - Use next-gen formats: WebP, AVIF
  - Remove render-blocking resources
  - Use a CDN

**FID / INP — Interaction to Next Paint** (Interactivity)
- Measures responsiveness to user input
- **Target**: Under 200ms
- How to improve:
  - Break long JavaScript tasks into smaller chunks
  - Use `requestIdleCallback` for non-critical work
  - Minimize main thread blocking

**CLS — Cumulative Layout Shift** (Visual Stability)
- Measures unexpected layout shifts during load
- **Target**: Under 0.1
- How to improve:
  - Always set explicit `width` and `height` on `<img>` tags
  - Reserve space for ads and embeds
  - Don't inject content above existing content dynamically
  - Use `aspect-ratio` CSS property for media

### Image Optimization
- **Format**: Use WebP (85%+ browser support), AVIF for modern browsers, PNG/JPEG as fallback
- **Compression**: Aim for < 200KB for hero images, < 50KB for thumbnails
- **Lazy loading**: `loading="lazy"` on all below-fold images
- **Responsive images**: Use `srcset` and `sizes` attributes
- **Dimensions**: Always specify `width` and `height` attributes (prevents CLS)

### CSS & JS Performance
- **Critical CSS**: Inline above-fold styles in `<head>`, defer the rest
- **Code splitting**: Load JS only when needed (dynamic imports)
- **Tree shaking**: Remove unused JavaScript from bundles
- **Minification**: All CSS and JS in production
- **Caching**: Set proper cache headers; fingerprint asset filenames

### Font Performance
- Use `font-display: swap` to prevent invisible text
- Preconnect to font CDN: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Self-host fonts when possible for maximum control
- Subset fonts to only the characters/weights you need

---

## 11. FORMS, INPUTS & FEEDBACK

Forms are where users give you something. Make it easy.

### Form Design Principles
- **Single column layouts**: Easier to complete than multi-column forms (per research)
- **Label placement**: Labels ABOVE inputs (not beside) — best for mobile and line-length clarity
- **Never use placeholder as a label**: Placeholder disappears on focus; users forget what the field is
- **Group related fields**: Name fields together, address fields together
- **Progress indicators**: For multi-step forms, show where users are and how much is left
- **Smart defaults**: Pre-fill whatever you can (country from IP, current date for date fields)
- **Keyboard flow**: Tab order must be logical, top-to-bottom, left-to-right

### Input Field Specs
- **Height**: Minimum 44px, ideally 48px
- **Border**: 1–2px solid with sufficient contrast. Change border color on focus (don't just add outline).
- **Focus state**: Visually prominent — blue border, ring, or color shift
- **Error state**: Red border + error icon + text message below the field
- **Success state**: Green border or checkmark after valid input
- **Disabled state**: Reduced opacity (0.5–0.6), no pointer cursor

### Validation Rules
- **Validate on blur** (when user leaves a field), not on keystroke (too aggressive)
- **Exception**: Password strength can update on keystroke (positive reinforcement)
- **Error messages**: Specific and actionable. "Invalid email" → "Please enter a valid email address (e.g., name@example.com)"
- **Never clear a form on error** — the user's input is precious
- **Mark required fields clearly**: Asterisk (*) with a legend, not just "required" buried in instructions

### CTAs (Call to Action) — Button Best Practices
- **Primary CTA**: One per screen. High contrast, prominent, action-verb label
- **Button labels**: Verb + noun: "Create Account", "Download Report", "Start Free Trial" — not just "Submit" or "Click Here"
- **Hierarchy**: Primary (filled) > Secondary (outlined) > Tertiary (text/ghost)
- **Loading state**: Disable button + show spinner after click to prevent double-submission
- **Destructive actions**: Use red/warning colors. Add a confirmation step.

---

## 12. CONTENT STRATEGY

### Writing for the Web
- **Front-load key information**: Say the most important thing first (inverted pyramid)
- **Scannable**: Users scan before they read. Use headings, bullets, bold for key terms.
- **Short paragraphs**: 2–4 sentences max. One idea per paragraph.
- **Active voice**: "We build websites" > "Websites are built by us"
- **Plain language**: Write for a 9th-grade reading level unless audience requires otherwise
- **Avoid jargon**: Unless your audience explicitly uses and understands it

### Content Hierarchy on a Page
1. **Headline**: What this is / what it does (benefit-oriented, not feature-oriented)
2. **Subheadline**: Supporting context or key differentiator
3. **Primary CTA**: The action you want them to take
4. **Social proof**: Reviews, logos, numbers that build trust
5. **Feature/benefit breakdown**: Details for the considering phase
6. **Secondary CTA**: Catch those who scrolled past the first
7. **FAQ**: Handle objections
8. **Final CTA**: Last chance to convert

### SEO Content Considerations
- One `<h1>` per page with the primary keyword
- Meta description: 150–160 characters, compelling, include keyword
- `<title>` tag: 50–60 characters, unique per page
- URL slugs: Lowercase, hyphen-separated, descriptive (`/web-design-best-practices`, not `/page?id=123`)
- Structured data (Schema.org): Helps Google display rich snippets

---

## 13. IMAGERY & MEDIA

### Photography Guidelines
- **Authentic over stock**: Real people, real places outperform generic stock photography
- **Consistent style**: Same color grading, composition style, and mood across all photos
- **Focal points**: Place faces and subjects using the rule of thirds
- **Alt text**: Every meaningful image must have descriptive alt text
- **Avoid clichés**: Handshakes, people staring at laptops, staged team photos

### Illustration Style
- If using illustrations, commit to a **single consistent style** across the entire site
- Avoid mixing 3D renders, flat vectors, and isometric illustrations
- Brand your illustrations — unique illustration style is a powerful differentiator
- Custom > Stock illustration libraries (Undraw, etc. are recognizable and generic)

### Video
- **Never autoplay with sound** — always muted, ideally user-initiated
- Autoplay muted video on hero sections can increase engagement (but test it)
- Always provide a text alternative or transcript
- Compress aggressively: `.mp4` with H.264, target under 5MB for background loops
- Offer poster/thumbnail for the initial frame

### Icons
- Use a single icon library throughout (don't mix Feather + Material + FontAwesome)
- Icons must always have a text label OR an aria-label — never stand alone
- Consistent sizing: Pick 2–3 sizes (16px, 20px, 24px) and use them uniformly
- Filled vs. outlined: Use one style consistently (outlined for inactive, filled for active is a common pattern)

---

## 14. MOTION & MICRO-INTERACTIONS

Motion should serve a purpose: guide attention, confirm actions, provide delight.

### The Principles of Good Motion
- **Purposeful**: Every animation must explain something or acknowledge an action
- **Fast**: UI transitions should be 150–300ms. Nothing over 500ms unless it's a full-page transition.
- **Easing**: Use ease-in-out for most transitions. ease-in for exiting elements. ease-out for entering elements. Never linear (feels robotic).
- **Subtle by default**: Save dramatic motion for meaningful moments (onboarding, major state changes)
- **Never block interaction**: Animations should not delay users from their next action

### Essential Micro-interactions
- **Hover states**: Color shift, shadow, slight scale (1.02–1.05×) — keeps UI feeling alive
- **Button press**: Slight scale-down (0.97×) + color darken — physical feedback analogy
- **Form focus**: Border color change + optional ring — clear feedback of active field
- **Toggle switch**: Smooth sliding pill — the motion communicates the state change
- **Loading skeleton**: Shimmer effect on placeholder content — better than spinners for content
- **Success checkmark**: Animated draw for form submission success — satisfying confirmation

### Page Transitions & Scroll Animations
- **Fade-in on scroll**: Elements entering viewport fade in (opacity 0→1, translateY(20px)→0)
- **Staggered reveals**: Cards/items animate in with sequential delay (50–100ms between items)
- **Parallax**: Use very subtly (10–20% offset), never on mobile (performance + motion sickness)
- **Page transitions**: Fade between pages for SPAs (250–350ms) — smoother perceived navigation

### prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Always implement this. Some users have vestibular disorders where motion causes physical discomfort.

---

## 15. COMMON MISTAKES TO AVOID

### Design Mistakes
- ❌ **Using too many fonts**: Stick to 2 max. 3 absolute maximum.
- ❌ **Pure black (#000) on pure white (#fff)**: Too harsh. Use near-black on off-white.
- ❌ **Centering all text**: Center large display text only. Body text is always left-aligned (in LTR languages).
- ❌ **Low contrast text**: Gray-on-white is a conversion killer and accessibility failure.
- ❌ **Inconsistent spacing**: Using random margin/padding values destroys visual rhythm.
- ❌ **Generic stock photography**: Erodes trust. Invest in real photography.
- ❌ **No visual hierarchy**: Everything at the same visual weight = nothing stands out.
- ❌ **Ignoring empty states**: Zero-data states (empty cart, no search results) need design too.

### UX Mistakes
- ❌ **Hiding navigation on desktop**: Never make users work to find the menu.
- ❌ **Carousels as a default**: Auto-advancing carousels have very low engagement. Users rarely go past slide 1.
- ❌ **Pop-ups on page load**: Intrusive, signals spam, kills first impressions. At minimum, delay 30+ seconds.
- ❌ **Disabled back button**: Never. This enrages users.
- ❌ **Infinite scroll without a way back**: Users lose their position. Add "Load More" or pagination for commerce/content.
- ❌ **Making the logo too small**: Users click logos to go home — it must be easy to find.
- ❌ **Unclear CTAs**: "Learn More" tells users nothing. Be specific about what happens next.

### Mobile Mistakes
- ❌ **Small touch targets**: Buttons under 44px are frustrating to tap.
- ❌ **No mobile nav**: Desktop navigation doesn't shrink — it needs a mobile alternative.
- ❌ **Horizontal overflow**: Always test for horizontal scroll on mobile — it breaks trust.
- ❌ **Blocking zoom**: `user-scalable=no` is an accessibility violation.
- ❌ **Ignoring mobile keyboard**: Fixed bottom elements get covered by mobile keyboard. Test this.
- ❌ **Dense text**: Paragraphs that work on desktop need more breathing room on mobile.

### Performance Mistakes
- ❌ **Uncompressed images**: The #1 performance killer. Compress everything.
- ❌ **Loading all JS upfront**: Lazy load non-critical scripts.
- ❌ **No image dimensions**: Causes layout shift (CLS penalty).
- ❌ **Too many web fonts**: Every weight = another HTTP request.
- ❌ **Blocking render with scripts**: Always `defer` or `async` non-critical scripts.

### Accessibility Mistakes
- ❌ **No alt text on images**: Screen readers announce "image" — useless.
- ❌ **`outline: none` without replacement**: Keyboard users lose their position on the page.
- ❌ **Low-contrast text**: Affects 8% of males who have color vision deficiency.
- ❌ **Missing form labels**: Placeholder text is not a label substitute.
- ❌ **Non-semantic HTML**: Using `<div>` for everything breaks screen readers and keyboard nav.

---

## 16. MASTER PROMPT TEMPLATES FOR ANTIGRAVITY

The following are ready-to-use prompt templates. Copy, customize, and use them directly with Antigravity or any AI-powered design/development tool. Bracket text `[like this]` indicates where you fill in your specifics.

---

### PROMPT 1 — Full Website Design Brief

```
Design a [type of website: e.g. SaaS landing page / e-commerce store / portfolio / corporate site] 
for [brand/company name], a [one-line description of what they do].

Target audience: [describe the user — age range, profession, device habits, technical literacy]
Brand personality: [e.g. bold and modern / warm and approachable / luxury and refined / playful and creative]
Primary goal: [e.g. drive signups / sell product / showcase portfolio / generate leads]
Primary CTA: [e.g. "Start Free Trial" / "Shop Now" / "Book a Call"]

Design requirements:
- Apply an 8-point spacing grid throughout (all spacing in multiples of 8px)
- Use a 60-30-10 color system: 60% neutral/background, 30% secondary, 10% accent
- Ensure all text meets WCAG AA contrast minimums (4.5:1 for body text)
- Implement a modular type scale based on a Perfect Fourth ratio (1.333) from a 16px base
- Use a maximum of 2 typeface families — one display, one body
- Mobile-first layout using CSS Grid for macro structure, Flexbox for components
- All interactive elements must have hover, focus, active, loading, and error states
- Include responsive breakpoints at 640px, 768px, 1024px, 1280px

Pages needed: [list pages: Home, About, Services, Pricing, Contact, etc.]

Avoid: generic purple gradients, overused fonts (Inter, Roboto), stock-looking layouts, 
clipart-style icons, non-semantic HTML.
```

---

### PROMPT 2 — Hero Section

```
Create a hero section for [brand name], a [one-line description].

Headline: [your headline or ask AI to generate]
Subheadline: [supporting text or ask AI to generate]
Primary CTA: "[Button Label]" → links to [destination]
Secondary CTA: "[Optional secondary label]" → [destination]

Layout: [e.g. centered with image below / left text + right image / full-bleed background with overlay text]
Visual: [e.g. use a gradient mesh background / product screenshot mockup / abstract geometric shapes / photography placeholder]
Mood: [e.g. energetic and bold / calm and professional / dark and premium]

Technical requirements:
- LCP-optimized: hero image preloaded with <link rel="preload">
- No layout shift: explicit image dimensions
- H1 tag on headline (one per page only)
- Mobile layout: stack content vertically, image below text
- Desktop layout: [describe two-column or full-bleed arrangement]
- Minimum button size: 48px height, 160px+ width
- All animations must respect prefers-reduced-motion
```

---

### PROMPT 3 — Navigation Component

```
Build a responsive navigation component for [site name].

Logo: [left-aligned / centered]
Nav links: [list 5-7 link names, e.g. Home / About / Services / Pricing / Blog / Contact]
CTA button: "[Label]" — [primary or secondary style]

Desktop behavior:
- Horizontal nav, all links visible
- Sticky on scroll with [subtle shadow / blurred backdrop / solid background] on scroll
- Active page highlighted via [underline / background pill / bold weight / color]
- Dropdown menu for: [any link that has submenu items]

Mobile behavior (under 768px):
- Hamburger icon (top-right)
- Full-screen or right-side drawer overlay
- Links stacked vertically, large touch targets (min 48px height)
- Close via X button or tap outside
- aria-expanded attribute toggled on hamburger
- Focus trap within open menu

Accessibility:
- Use <nav> semantic element with aria-label="Main Navigation"
- aria-current="page" on active link
- Keyboard navigable (Tab through links, Escape closes mobile menu)
- Focus-visible ring on all focused elements
```

---

### PROMPT 4 — Card Grid / Content Grid

```
Design a responsive card grid for [context: e.g. blog posts / team members / products / features / testimonials].

Card contents:
- [Element 1: e.g. image/thumbnail]
- [Element 2: e.g. category tag]
- [Element 3: e.g. title]
- [Element 4: e.g. description excerpt]
- [Element 5: e.g. author + date / price + CTA / rating]

Grid layout:
- Mobile (< 640px): 1 column
- Tablet (640–1024px): 2 columns
- Desktop (1024px+): [3 or 4] columns
- Use CSS Grid with auto-fill/minmax for intrinsic responsiveness
- Gap: 24px (mobile) / 32px (desktop)

Card design:
- Border radius: [8–16px]
- Background: [white / slight gray / dark surface for dark mode]
- Shadow: [subtle box shadow / border / none]
- Hover state: [lift with shadow increase / border color change / scale 1.02]
- Image: fixed aspect ratio (16:9 or 3:2), object-fit: cover
- All cards: equal height within each row

Accessibility:
- Card link wraps entire card for full tap target, not just title
- aria-label on card links for screen reader context
- Lazy load images below fold
```

---

### PROMPT 5 — Form Design

```
Design a [form type: e.g. contact form / signup form / checkout form / search form] for [site name].

Fields required:
- [Field name] — [type: text / email / tel / select / textarea / checkbox / radio]
- [Repeat for all fields]
- Required fields: [list which are required]

Design specs:
- Single column layout
- Labels ABOVE inputs (not placeholder-only)
- Input height: 48px
- Visible border on all inputs (1.5px solid)
- Focus state: border color change to primary brand color + focus ring
- Error state: red border + error icon + descriptive message below field
- Validate on blur, not on keystroke (except password strength)
- Submit button: full-width on mobile, [auto-width / full-width] on desktop
- Loading state: disable button + spinner on submit
- Success state: [replace form with success message / inline success banner]

Mobile optimizations:
- type="email" for email, type="tel" for phone (correct mobile keyboards)
- autocomplete attributes on all fields
- Font size minimum 16px in inputs (prevents iOS zoom)

Accessibility:
- <label for=""> on every input
- aria-required="true" on required fields
- aria-describedby pointing to error messages
- Error messages announced via aria-live="polite"
```

---

### PROMPT 6 — Responsive Typography System

```
Create a complete responsive typography system for [brand/site name].

Brand personality: [e.g. editorial / technical / luxury / friendly / bold]

Typeface choices:
- Display/Heading font: [specific font name or "choose a distinctive, non-generic font appropriate for the brand"]
- Body font: [specific font name or "choose a highly legible body font that pairs with the display font"]
- Monospace font (if needed for code): [e.g. JetBrains Mono, Fira Code]

Type scale: Perfect Fourth (1.333) ratio from 16px base
Sizes:
- xs:  12px (captions, fine print)
- sm:  14px (labels, secondary text)
- md:  16px (body — base)
- lg:  21px (lead text, large body)
- xl:  28px (h4 equivalents)
- 2xl: 37px (h3)
- 3xl: 49px (h2)
- 4xl: 65px (h1 display)

All heading sizes use fluid clamp() for smooth scaling:
- Minimum at 320px viewport
- Maximum at 1280px viewport

Line heights:
- Display/headings: 1.1–1.25
- Body text: 1.5–1.7
- UI labels: 1.2–1.4

Line length constraint: max-width 65ch on all body text containers
Font weights: [list weights needed — typically 400 regular + 600 semibold + 700 bold]
```

---

### PROMPT 7 — Color System

```
Generate a complete color system for [brand name].

Brand color (primary): [hex code or "suggest based on brand personality: [describe]]
Brand secondary color: [hex code or "suggest a complementary secondary"]

Deliverables:
1. Primary palette: 10 shades (50 lightest → 950 darkest) for the primary brand color
2. Neutral/gray palette: 10 shades for backgrounds, text, borders
3. Semantic colors:
   - Success: green-based, 5 shades
   - Warning: amber-based, 5 shades
   - Error: red-based, 5 shades
   - Info: blue-based, 5 shades

Light theme:
- Page background: [near-white, e.g. Neutral-50]
- Card/surface background: [white or Neutral-100]
- Body text: [Neutral-900]
- Secondary text: [Neutral-600]
- Muted text: [Neutral-400]
- Border default: [Neutral-200]
- Primary action: [Primary-600]
- Primary hover: [Primary-700]
- Primary text on primary: [white or Primary-50]

Dark theme (if needed):
- Page background: [very dark, e.g. Neutral-950]
- Card/surface: [Neutral-900]
- Body text: [Neutral-100]
- Secondary text: [Neutral-400]
- Muted text: [Neutral-600]
- Border: [Neutral-800]
- Primary action: [Primary-400 — lighter for dark bg]

All color combinations must pass WCAG AA (4.5:1 for text, 3:1 for UI elements).
Output as CSS custom properties (--color-primary-500, etc.).
```

---

### PROMPT 8 — Responsive Layout System

```
Build a complete responsive layout system for [site/app name].

Breakpoints:
- Mobile: < 640px
- Tablet: 640px – 1024px
- Desktop: 1024px – 1280px
- Wide: > 1280px

Container:
- Max-width: 1280px
- Center with margin: auto
- Horizontal padding: clamp(16px, 5vw, 80px)
- Nested content max-width: 760px for text-heavy sections

Grid system:
- Use CSS Grid with 12 columns on desktop
- 8 columns on tablet
- 1-2 columns on mobile
- Column gap: 24px (mobile) / 32px (desktop)
- Row gap: 24px (mobile) / 48px (desktop)

Spacing scale (8-point grid):
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 32px
--space-7: 40px
--space-8: 48px
--space-9: 64px
--space-10: 80px
--space-11: 96px
--space-12: 128px

Section vertical spacing:
- Mobile: 64px between sections
- Desktop: 96–128px between sections

Apply mobile-first CSS (base styles = mobile, use min-width media queries to enhance).
```

---

### PROMPT 9 — Accessibility Audit & Fix

```
Audit the following [component / page / codebase] for WCAG AA accessibility compliance and fix all issues found.

Check and fix:
1. Semantic HTML: Replace all div-as-button and div-as-link with proper <button> and <a> elements
2. Image alt text: Add descriptive alt text to all meaningful images; empty alt="" on decorative ones
3. Form labels: Ensure every input has an associated <label for=""> — never rely on placeholder alone
4. Focus indicators: Add visible focus ring to all interactive elements (never outline: none without replacement)
5. Color contrast: Flag and fix any text with less than 4.5:1 contrast ratio against background
6. ARIA: Add aria-expanded, aria-label, aria-live, aria-current, role attributes where appropriate
7. Keyboard navigation: Verify Tab order is logical; all modals have focus traps; Escape closes overlays
8. Skip links: Add "Skip to main content" link as first focusable element on page
9. Headings: Verify proper heading hierarchy (one H1, no skipped levels)
10. Motion: Add prefers-reduced-motion media query to all CSS animations and transitions
11. Touch targets: All touch targets minimum 44×44px with 8px spacing between them
12. Language: Add lang="en" (or appropriate language) to <html> tag
13. Page title: Ensure each page has a unique, descriptive <title> tag

Output: List every issue found with its location and the corrected code.
```

---

### PROMPT 10 — Performance Optimization Pass

```
Optimize the following [website / component / codebase] for Core Web Vitals performance.

LCP Optimization (target < 2.5s):
- Identify the Largest Contentful Paint element and add <link rel="preload"> in <head>
- Convert all images to WebP/AVIF format with JPEG/PNG fallback via <picture> element
- Add explicit width and height attributes to all images
- Remove render-blocking CSS and JS from <head>
- Implement a CDN for static assets

CLS Optimization (target < 0.1):
- Add explicit dimensions to all media elements (img, video, iframe)
- Reserve space for dynamically loaded content
- Add aspect-ratio CSS where dimensions are fluid

INP Optimization (target < 200ms):
- Defer all non-critical JavaScript with defer or async attributes
- Break long JavaScript tasks into chunks using setTimeout or requestIdleCallback
- Minimize DOM size (under 1500 elements recommended)

Image optimization:
- Add loading="lazy" to all below-fold images
- Use srcset for responsive images
- Add fetchpriority="high" to hero/LCP image

Font optimization:
- Add font-display: swap to all @font-face declarations
- Add <link rel="preconnect"> for Google Fonts or font CDN
- Self-host fonts if possible

Output: List each optimization applied with before/after code.
```

---

## QUICK REFERENCE CHECKLISTS

### Pre-Launch Design Checklist

**Visual Design**
- [ ] Consistent 8-point spacing throughout
- [ ] Maximum 2 typeface families used
- [ ] Color system with primary, secondary, neutrals, and semantic colors defined
- [ ] All text meets WCAG AA contrast (4.5:1 body, 3:1 UI)
- [ ] Visual hierarchy clear on every page (one obvious primary action)
- [ ] Consistent component states (hover, focus, active, disabled, error, loading)

**Responsiveness**
- [ ] Tested at 320px, 375px, 768px, 1024px, 1280px, 1440px
- [ ] No horizontal scroll at any viewport width
- [ ] Mobile nav implemented and functional
- [ ] Touch targets minimum 44×44px
- [ ] No hover-only interactions (all work on touch)
- [ ] Input types correct for mobile keyboards

**Accessibility**
- [ ] Semantic HTML throughout (header, nav, main, section, article, footer)
- [ ] One H1 per page; logical heading hierarchy
- [ ] All images have alt text
- [ ] All form inputs have visible labels
- [ ] Keyboard navigable (Tab through all interactive elements in logical order)
- [ ] Visible focus indicator on all focused elements
- [ ] Focus trap in modals
- [ ] prefers-reduced-motion respected
- [ ] lang attribute on <html>

**Performance**
- [ ] LCP image preloaded
- [ ] All images: WebP format, explicit dimensions, lazy loading (except above fold)
- [ ] Scripts deferred
- [ ] Fonts: display: swap, preconnect
- [ ] CSS and JS minified
- [ ] No layout shifts after load (CLS < 0.1)

**UX**
- [ ] Every page has one clear primary CTA
- [ ] Navigation shows active page
- [ ] Error states designed for all forms
- [ ] Empty states designed for all dynamic lists
- [ ] Success confirmations after form submissions
- [ ] 404 page designed with way to navigate back
- [ ] Breadcrumbs on pages with 3+ depth levels

---

*This document is intended as a living reference. Update it as web standards, accessibility requirements, and browser capabilities evolve. Last reviewed: 2026.*
