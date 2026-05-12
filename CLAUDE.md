# CLAUDE.md — Project Knowledge for AI Assistants

> **READ THIS FIRST.** Single source of truth for working on this portfolio with Claude Code on any machine. Travels with the repo via Git.

## What this is

Personal portfolio for **Mohab Tohamy** — frontend engineer in Riyadh targeting Austria 2026. Showcases React/Next.js, Python automation, GIS, and pavement/infrastructure engineering domain knowledge. Audience: Austrian engineering companies.

Also see [`ONBOARDING.md`](./ONBOARDING.md) for the original design-system reference.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind v4**
- **Three.js / R3F / drei / postprocessing** for the 3D Lab
- **Lenis** for smooth scroll on `/three-lab/classic` (the spacetime scene). Required because `globals.css` has `scroll-behavior: smooth` globally, which fights any RAF-driven scrollTo
- **GSAP** is installed but currently unused (was on classic, replaced with Lenis + scroll-progress refs)
- **MapLibre GL** for `/map-demo`
- **Recharts** for `/dashboard`
- **Framer Motion** for UI animations + depth-zoom card entrances
- **No backend.** No email API, no Resend, no nodemailer. Contact page is just a big email + copy button.

```bash
npm run dev        # dev
npm run build      # production
npx tsc --noEmit   # type-check
```

---

## Workflow rules (READ BEFORE EXPLORING)

1. **Don't Glob/Grep first** — the file map below tells you exactly where things live.
2. **Don't re-read files between turns** unless the user asks for verification.
3. **Common bug → fix table** is at the bottom. Check it before exploring.
4. **Update this file** when you make changes that will repeat as patterns. The next session inherits the knowledge.

---

## Design system (hard rules — NEVER violate)

**Tokens** in `app/globals.css`:

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#0E0D0B` | Background |
| `--bg-elevated` | `#15140F` | Drawers, tooltips |
| `--bg-card` | `#1A1812` | Card surfaces |
| `--fg` | `#F5F1EA` | Primary text |
| `--fg-muted` | `#A39D8F` | Secondary text |
| `--fg-dim` | `#6B6759` | Tertiary (mono, captions) |
| `--accent` | `#E8704F` | The **only** accent — coral |
| `--hairline` | `rgba(245,241,234,0.08)` | Subtle dividers |
| `--hairline-strong` | `rgba(245,241,234,0.16)` | Hover/active dividers |

**Fonts:** Instrument Serif (display), Inter (body), JetBrains Mono (numbers/captions).

**Hard NO list:**
- No gradient text
- No glass-morphism cards with emoji thumbnails
- No emoji bullets (✓ 🛠️ 🎯)
- No "passionate about", "modern", "leveraging", "many functionalities"
- No focus rings (global `*:focus { outline: none }`)
- No `new Vector3()` inside `useFrame` (GC pressure → use scalar refs + `setScalar`)
- No `gsap.fromTo()` in scroll scenes (jump on re-trigger) — use `gsap.set()` + `gsap.to()`
- No `alert()` in UI — use toast state
- No re-importing removed components: `MouseDistortionLoader`, `LusionConnectors`, `FunnySurvey`
- No backend / API routes for the contact form — kept simple on purpose

**Copy voice:** Statements with periods, not questions. Specific numbers ("six thousand particles"). Opinions over platitudes.

---

## File map

### Pages
| Route | File | Notes |
|---|---|---|
| Home | `app/page.tsx` | Hero, featured work, skills, Austria CTA |
| About | `app/about/page.tsx` | Experience timeline, skills |
| Contact | `app/contact/page.tsx` | NO form. Big email + copy button + green pulse availability dot |
| Dashboard | `app/dashboard/page.tsx` | Recharts on synthetic pavement |
| Map Demo | `app/map-demo/page.tsx` | MapLibre GL, editorial design (was legacy glass — now redone) |
| Projects | `app/projects/page.tsx` | 12 projects, category filter |
| Tools | `app/tools/page.tsx` | Length splitter / row repeater / Haversine |
| 3D Lab Hub | `app/three-lab/page.tsx` | Particle ring + 4 nodes. **StarField is `memo()`d**. **FpsBridge writes to DOM ref** — never re-introduce React state for fps |
| Ball Pit | `app/three-lab/ballpit/page.tsx` | Drawer is `top-16` NOT `top-0` (nav covers top-0). Icon classes use `w-5`, never `w-4.5` |
| Spacetime | `app/three-lab/classic/page.tsx` | **Einstein's spacetime fabric.** Custom GLSL shader deforms a plane. Cards use `<DepthCard>` for depth-zoom entrance |
| Holographic | `app/three-lab/futuristic-dashboard/page.tsx` | Distortion shaders. OrbitControls `minDistance=6`, `maxDistance=20` |
| Particle Ring | `app/three-lab/particle-ring/page.tsx` | 6600 GPU particles + 4 planets + central star + Stars background. **Bloom intensity=0.35, threshold=0.35** (NOT 0.9/0.05) |

### Components
| File | Purpose | Notes |
|---|---|---|
| `components/Navigation.tsx` | Site nav, fixed `top-0 z-50`, h-16 | Anything else fixed must use `top-16` to avoid being covered |
| `components/UI.tsx` | `Button`, `Card`, `Section`, `SectionTitle`, `Eyebrow` | `Button` has `disabled` prop. Internal hrefs → `<Link>`, external/mailto → `<a>` |
| `components/Ballpit.tsx` | Physics class for ball pit | See "Ballpit physics model" below |
| `components/LiquidBackground.tsx`, `LiquidEther.tsx`, `MouseDistortion.tsx` | Effect components | |
| `components/MouseDistortionLoader.tsx`, `LusionConnectors.tsx`, `FunnySurvey.tsx` | **REMOVED** | Files exist for reference; never re-import |

### Data & lib
| File | Exports |
|---|---|
| `data/projects.ts` | 12 projects, `featured: boolean` |
| `data/experience.ts` | 3 jobs + 14 skills (level 0-100) |
| `data/mapData.ts` | Synthetic pavement survey GeoJSON |
| `lib/utils.ts` | `splitLength`, `repeatRows`, `haversine`, color mappings |
| `lib/particleUtils.ts` | `pointsInner` (2500 stars), `pointsOuter` (625 stars) for hub |

---

## Key behavioral models (don't break these)

### Ballpit physics (sphere0 / cursor model)

The ball pit has a special "sphere0" — the cursor-following ball. Two **independent** state flags govern it:

| Flag | Meaning | Driven by |
|---|---|---|
| `controlSphere0` | Is cursor over canvas right now? | Pointer events (`onMove` / `onLeave`) |
| `followCursor` | Should sphere0 be **visible**? | The drawer toggle |

**Critical rule:** sphere0 is **always** excluded from the gravity/friction loop (`startIdx = 1`). When `controlSphere0=false`, sphere0 is parked at `(0, -10000, 0)` so it can never fall as a giant invisible obstacle that freezes the simulation. The cursor effect (pushing balls) **always runs** when cursor is over canvas — the `followCursor` toggle only changes whether the cursor sphere is rendered.

When user reports "balls don't move" → check `Ballpit.tsx` `W.update()` lines ~344-380. Don't wire `followCursor` into `controlSphere0`.

### Spacetime scroll scene (`/three-lab/classic`)

**Uses Lenis for smooth scroll** because `globals.css` sets `scroll-behavior: smooth` globally — that fights any RAF-based `window.scrollTo()` calls (auto-scroll gets stuck/jerky). Lenis takes over scroll entirely and exposes `scrollTo(target, { duration, easing, onComplete })`.

Custom GLSL vertex shader on a `PlaneGeometry(40, 40, 100, 100)`:
- `well(mass, wp) = strength * exp(-d² * 0.045)` — static Gaussian wells per mass
- `ripple(wp, impactTime, now)` — three Gaussian rolling waves spawned 0s, 1.4s, 2.8s after sun's impact, expanding at 5.5 u/s and decaying exponentially
- Ambient `sin(d - t)` — gravitational wave background, always on

**Module-level refs (NOT React state)** drive the scene:
- `scrollProgressRef.current` — 0..1, written by Lenis `'scroll'` event handler
- `impactTimeRef.current` — timestamp of sun's impact (-1 if not yet)
- `hasImpactedRef.current` — boolean latch (resets when scroll < 5%)

**Sun (mass 0) — TWO-PHASE long expansion:**
- **Phase 1 (0 → 25% scroll):** sun falls from y=8 to y=0.5 (surface) with `easeOutBounce`
- **Phase 2 (25 → 100% scroll):** sun **sinks deeper into the well** from y=0.5 → y=-1.8 with `easeOutCubic`. The well expands downward with it the entire time.
- Strength ramps 0 → 4.0 across full scroll (peaks at 95%) — well keeps deepening
- At ~p=0.225 (when fallT > 0.9), `hasImpactedRef` flips true → impact timer set → ripples fire
- Sun sphere has scale-pulse impact effect (scale 1.18 → 1 with exp decay)
- Atmospheric glow sphere around sun (additive blend, opacity ramps with strength)

**Planets (mass 1-3):**
- Always orbit (independent of scroll — keeps moving like a video)
- Radius factor: `(1.6 - easeOutCubic(p) * 0.55) + sin(p * 1.5π + phase) * 0.4` — slow breathing
- Activated only after p > 0.3 (`scale` and `light.intensity` both ramp from 0 with easeOutCubic)
- Bob slightly above fabric: `m.radius * 0.6 + sin(t * 1.5) * 0.08`

**Camera — SINGLE continuous path (no phase boundaries):**
Previous version had 3 keyframed phases that didn't match at boundaries → caused visible "snap rotation" at p=0.3 and p=0.65. Fixed: one smooth arc throughout, eased with `0.5 - 0.5 * cos(p * π)`.
- Angle sweeps 0 → 0.45π (gentle 81° total)
- Radius lerps 11 → 16 (slow pull-back)
- Height lerps 10 → 5.5 (descends with sun)
- Look target lerps from y=1.0 down to y=-0.8 (follows sun into the deep well)

**Section heights:** `h-[150vh]` on every DepthCard (not h-screen). Taller sections give more scroll pixels per progress unit, making every animation feel ~50% longer.

**Auto-scroll:** `lenis.scrollTo(max, { duration: 28, easing: cosineInOut, onComplete })`. Click button to play, click again (or click while playing) to stop via `lenis.stop() + lenis.start()`. Backup setTimeout in case `onComplete` doesn't fire.

**Bodies sit either ABOVE or INSIDE the fabric:**
- Planets: y = `radius * 0.6` (sit on top of flat fabric)
- Sun: y is DYNAMIC — falls from sky, lands on surface, sinks into the well as scroll progresses (intentional — that's the whole point of the scene)

Cards use `<DepthCard>` with framer-motion `whileInView` — start scale 0.45, blur 18px, y +60 → animate in. `viewport={{ once: false }}` so it works bidirectionally on scroll up.

### 3D Lab hub fps fix

`FpsBridge` writes fps directly to a `<span>` via `ref.current.textContent` — **never** put fps in React state. State updates would re-render the page → reconcile 3,125 `<Instance>` children in StarField → ~16ms spike → visible stutter and OrbitControls jitter.

`StarField` is wrapped in `React.memo` for the same reason.

### All Canvas elements

Use `dpr={[1, 1.5]}` to cap pixel ratio. Without this, retina screens render at 2× = 4× the fragment work.

---

## Common bug → fix table

| Symptom | File | Fix |
|---|---|---|
| Drawer X / close button invisible | any drawer using `fixed top-0` | Change to `top-16`, mobile backdrop also uses `top-16 inset-x-0 bottom-0` |
| Tailwind class doesn't render | any | `w-4.5` doesn't exist. Use `w-4` or `w-5` |
| 3D scene stutters every 0.5s | `app/three-lab/page.tsx` | fps must use DOM ref, not state. StarField must be `memo()` |
| Scroll scene cube/object jumps on scroll up | any GSAP scroll page | Use `gsap.set()` + `gsap.to()`, never `gsap.fromTo()` |
| Ball pit balls freeze | `components/Ballpit.tsx` `W.update()` | sphere0 must always be excluded from main physics loop. Don't wire `followCursor` into the physics — only into Z.update visibility |
| Bloom whites out the canvas | any postprocessing | intensity ≤ 0.4, luminanceThreshold ≥ 0.3 |
| Old `text-primary` / `bg-background` classes | any page | Legacy aliases. Prefer `text-[var(--fg)]` / `bg-[var(--bg)]` directly |
| OrbitControls zoom escapes scene bounds | any 3D page | Set `minDistance` and `maxDistance` props |
| Cards covered by WebGL canvas in scroll scene | classic | Cards parent must be `z-10`, sticky canvas must be `z-0` |
| Form submission requires backend | `app/contact/page.tsx` | NO. Contact page has no form — just email + copy + dot |
| Bodies in spacetime scene buried under wireframe | `app/three-lab/classic/page.tsx` `SpacetimeScene` | Body y must be POSITIVE (radius * 0.6 or higher). Never set y = `-strength * 0.5` |
| TS error "could not find declaration for gsap/all" | `components/Ballpit.tsx` | Don't import `gsap`/`Observer` — they're not used. Plain `import React, { useEffect, useRef } from 'react'` is enough |
| Auto-scroll button "doesn't work" / scroll feels stuck | any page using `window.scrollTo()` | `globals.css` has `scroll-behavior: smooth` globally. Browser's smooth-ease fights RAF scrollTo. Fix: use Lenis (`lenis.scrollTo(target, { duration, easing })`) which bypasses browser scroll entirely |

---

## Removed permanently (do not re-add)

- `MouseDistortionLoader` (was in `app/layout.tsx`)
- `LusionConnectors` (was in homepage hero)
- `FunnySurvey` (was on home + about)
- Contact form with form fields — replaced with big-email + copy approach
- `nodemailer` / `resend` packages — never installed in committed state

The component files exist for reference but are never imported anywhere. Don't reintroduce them.
