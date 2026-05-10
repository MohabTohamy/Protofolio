# Engineering Portfolio — Onboarding

Personal portfolio for **Mohab Tohamy** — frontend engineer in Riyadh, targeting Austria 2026. Showcases React/Next.js work, Python automation, GIS, and pavement/infrastructure engineering domain knowledge.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind v4**
- **Three.js / R3F / Drei / Postprocessing** for the 3D Lab
- **Rapier** physics for the ball pit
- **GSAP + ScrollTrigger** for scroll choreography
- **MapLibre GL** for the GIS map demo
- **Recharts** for the analytics dashboard

```bash
npm run dev      # development
npm run build    # production build
npx tsc --noEmit # type-check standalone
```

## Design system

**Editorial direction** — warm-near-black bg, off-white text, **one** coral accent. No gradient text. No glass-cards-with-emoji-thumbnails. Asymmetric layouts over centered cards.

### Tokens (in `app/globals.css`)

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#0E0D0B` | Page background (warm, not pure black) |
| `--bg-elevated` | `#15140F` | Tooltips, drawers |
| `--bg-card` | `#1A1812` | Card surfaces |
| `--fg` | `#F5F1EA` | Primary text |
| `--fg-muted` | `#A39D8F` | Secondary text |
| `--fg-dim` | `#6B6759` | Tertiary (mono numbers, captions) |
| `--accent` | `#E8704F` | Coral — the **only** accent color |
| `--hairline` | `rgba(245,241,234,0.08)` | Subtle dividers |
| `--hairline-strong` | `rgba(245,241,234,0.16)` | Hover/active dividers |

Backwards-compat aliases (`--color-foreground`, `--color-primary`, etc.) exist so any page using older `text-foreground` classes still resolves correctly.

### Fonts

- **Display**: Instrument Serif (h1/h2 only, via `.font-display` class) — single weight 400
- **Body**: Inter
- **Mono**: JetBrains Mono — for stats, numbers, eyebrows, tech tags

All loaded via `next/font/google` in `app/layout.tsx`.

### Utilities (in `globals.css`)

- `.font-display` — Instrument Serif, tight letter-spacing
- `.card-editorial` — hairline-bordered card with hover border-color transition (no shadow, no glass)
- `.divider` — 1px horizontal `--hairline` line
- `.link-arrow` — flex inline link with arrow that translates on hover
- `.eyebrow` — uppercase 12px tracked label
- `.grain` — fixed-position SVG noise overlay (added on `<body>` in layout)

User has a global `*:focus { outline: none !important }` reset — respect it. Don't add focus rings to chart SVGs.

## UI primitives (`components/UI.tsx`)

- `<Section narrow?>` — vertical padding + horizontal padding + centered `max-w-6xl` (or `max-w-3xl` if `narrow`)
- `<SectionTitle eyebrow? subtitle? align?>` — display-serif heading with optional eyebrow and lead paragraph
- `<Card hover?>` — uses `.card-editorial`
- `<Button variant="primary"|"ghost"|"secondary"|"outline"|"link" href? onClick?>` — **internal hrefs use Next.js `<Link>`**, external/mailto/tel/anchor use `<a>`. Don't break this.
- `<Eyebrow>` — wraps the eyebrow class

## Copy voice

- **No** "passionate about", "modern", "leveraging", "many functionalities"
- **No** emoji bullets (`✓`, `🛠️`, `🎯`)
- **Use** specific numbers: "two hundred bodies", "six thousand particles", "three jobs in three years"
- **Use** opinions: "I care about the boring parts — loading states, empty states, the thing that breaks at 4pm on Friday"
- Headlines are statements with periods, not questions or "Welcome to my portfolio"

## 3D Lab (`/three-lab`)

The lab hub is a **full-viewport particle ring scene** with 4 interactive project nodes.

- **Particle field**: 6,000 GPU points on 3 concentric rings, custom GLSL vertex + fragment shader. Position computed in shader from `aOffset` / `aRing` / `aSeed` attributes + `uTime` uniform.
- **Project nodes**: 4 `<sphereGeometry>` meshes at angle 0°/90°/180°/270° on radius 7. Each has:
  - `meshStandardMaterial` with `emissive` + `emissiveIntensity` ramped per-frame
  - Bob animation, hover scale-to-1.7×, halo torus that appears on hover
  - `<pointLight>` for local glow
- **Hover behavior**: `onPointerOver` sets `hoveredId` state. That:
  - Drives the node's scale + emissive pulse
  - Sets `uTarget` uniform on the particle shader → particles flow toward the node
  - Slides in a left-side editorial info card with project details
- **Click**: `router.push(project.href)`
- **Keyboard nav**: ← → ↑ ↓ / 1–4 / h j k l to cycle, Enter to open, Esc to clear
- **Camera**: auto-orbits at radius 14 when no hover; pauses on hover. Subtle mouse-driven parallax.
- **Postprocessing**: Bloom (`intensity=0.35`, `luminanceThreshold=0.35`) + ChromaticAberration + Vignette

### 3D Lab anti-patterns

**Don't over-bloom additive particle scenes.** A previous iteration with `intensity=0.95` + `luminanceThreshold=0.04` whited out the entire canvas. Keep:
- Bloom intensity ≤ 0.4
- Bloom luminanceThreshold ≥ 0.3
- Particle fragment: `col *= 0.45 + vGlow * 0.5` (not 0.7+)
- Particle alpha: `(core * 0.55 + halo) * depthFade`
- Node emissive at rest ~0.35, hovered ~1.0
- Point lights ~0.8 at rest, ~2.2 hovered

## Page structure

| Route | Purpose | Layout |
|---|---|---|
| `/` | Hero + featured work list + What I do + Tools + Austria + email CTA | Editorial, asymmetric 12-col |
| `/projects` | All 12 projects | Numbered list with expandable `+`/`−` rows |
| `/tools` | Length splitter, row repeater, Haversine | Three numbered sections, underline-style inputs |
| `/map-demo` | MapLibre GIS viewer | Legacy centered/glass — **not yet editorial** |
| `/dashboard` | Recharts analytics on synthetic pavement data | Editorial — coral/cyan/amber charts on warm bg |
| `/three-lab` | Interactive particle-ring hub | Full-viewport, 4 hoverable nodes |
| `/about` | Bio, experience, skills | Editorial conversational |
| `/contact` | Form + email + GitHub/LinkedIn | Underline-style form, big email link |

## Removed (files exist, don't re-add globally)

- `MouseDistortionLoader` (was in `app/layout.tsx`)
- `LusionConnectors` (was in homepage hero)
- `FunnySurvey` (was on home + about)

These are AI-template clichés that broke the editorial tone. Keep the source files for reference but don't import them into the global layout or the homepage.

## Known issues

- `app/map-demo/page.tsx` GeoJSON type narrowing is bridged with `as unknown as GeoJSON.FeatureCollection` casts — proper fix is to widen the `MapFeature` geometry union.
- `components/Ballpit.tsx` imports `gsap` and `Observer` from `gsap/all` to dodge a TS case-sensitivity issue with `gsap/Observer.d.ts` vs `gsap/observer.d.ts`.

## Data sources

- `data/projects.ts` — 12 projects with `featured: boolean`. 7 are featured.
- `data/experience.ts` — 3 jobs + 14 skills (`level: 0-100`, `category: Frontend | Backend | Engineering | Tools`)
- `data/mapData.ts` — synthetic pavement-survey data for dashboard + map
