# Portfolio Redesign Plan - Datta L

## 1. What exists today (audit)

**Current state:** static template portfolio. All sections are plain stacked cards with zero motion. Specific problems:

- Navbar scroll handler is dead code (never wired to `useEffect`, uses stale `useState` in a scroll listener - an anti-pattern anyway)
- Broken nav link (`#about` points nowhere)
- All project/social links are `href="#"` dead links
- Emojis used as icons
- No animations, no reveals, no hover physics - the "sucks" part
- One section style repeated 6 times (tag + title + card grid)
- `dist/` is stale build output

**What's worth keeping (content, not design):** all the actual data. Projects (Distributed URL Shortener, Collaborative Doc Editor, Metro Ticket Booking), Flipkart internship bullets, skills, NITK education, contact info. Copy gets lightly tightened, not rewritten.

## 2. Design read

**Reading this as:** developer portfolio for recruiters + engineering hiring managers, with a dark refined-tech language (Linear-ish, not hacker-terminal cliché), leaning toward Motion (framer-motion, already installed) + custom CSS design tokens.

**Dials:** `DESIGN_VARIANCE: 8` / `MOTION_INTENSITY: 7` / `VISUAL_DENSITY: 3`

## 3. Proposed aesthetic (pending your pick)

One theme, locked for the whole page. One accent color. Off-black backgrounds (zinc-950 family), no pure black. Geist Sans + Geist Mono (self-hosted). Icons from Phosphor (no emojis). Pill-shaped interactive elements, consistent radius system.

## 4. Tech stack

| Piece | Choice | Why |
|---|---|---|
| Framework | Keep React 18 + Vite 5 | Already in place |
| Animation | framer-motion (installed) | Springs, scroll-driven motion values, reveals - covers everything without adding GSAP |
| Styling | Custom CSS design tokens (rebuild `global.css` from scratch) | Portfolio is one bespoke page; full control over type/effects, zero new config |
| Icons | `@phosphor-icons/react` | Allowed library, consistent strokes |
| Fonts | Geist Sans + Geist Mono via Fontsource | Self-hosted, `font-display: swap`, no Google Fonts link |
| State | None added | `useMotionValue`/`useScroll` handle all continuous values (no `useState`-per-scroll-frame anywhere) |

## 5. Page structure + animation spec

Every animation has a named purpose (feedback / spatial consistency / state indication / storytelling). All motion honors `prefers-reduced-motion`.

### Nav
- Floating glass pill, appears after hero scroll, `useScroll`-driven (no scroll listeners)
- Active section highlighting via IntersectionObserver
- Scroll progress hairline
- Mobile: full-screen menu with staggered link reveal

### Hero (first impression carries the site)
- Kinetic type intro: name + role revealed with masked line stagger (spring, not linear)
- Role line with text-scramble decode on load
- Two magnetic CTAs (spring physics via `useMotionValue`, `useSpring`)
- Background: subtle animated grid/aurora canvas, GPU-cheap, dimmed
- No scroll cues, no decoration strips

### Tech marquee (the one allowed marquee)
- Infinite skill strip between hero and projects, pauses on hover, reverses direction per row

### Projects (the showpiece)
- **Sticky stacking cards**: each project card pins and the next slides over it, driven by `useScroll` + transforms
- Cards are bold typographic panels (index number, title, description, stack tags, links) with distinct tint per project - no fake screenshots
- Hover: subtle lift + link arrow nudge

### Experience
- Vertical timeline with a line that draws itself as you scroll (`scaleY` from scroll progress)
- Flipkart entry reveals with stagger; bullets tick in sequentially

### Skills
- 6-category asymmetric bento grid (exact cell count, no filler)
- Spotlight cards: border/inner glow follows the cursor (`useMotionValue`, springs) - no re-renders
- Real Phosphor icons per category

### Education + contact
- Education: compact two-entry strip (no card grid)
- Contact: full-height closing section - giant "Let's build something" headline, one magnetic email CTA, social links (Phosphor icons), location line
- No fake contact form (nothing backs it); email link + copy-to-clipboard with animated confirmation instead

### Footer
- Minimal single line

## 6. Data assumptions (fill in later, links are placeholders)

| Item | Assumption |
|---|---|
| GitHub | `https://github.com/datta-l` (placeholder) |
| LinkedIn | `https://www.linkedin.com/in/datta-l` (placeholder) |
| Project repo/demo links | Placeholder GitHub URLs on real repo-name guesses |
| Email / phone | Real, from current site (`ldatta01.dl@gmail.com`, `+91 8431468861`) |
| Project images | None - typographic cards instead (honest, and avoids fake-screenshot slop) |

## 7. Guarantees (pre-flight)

- Zero em-dashes, zero AI-slop patterns, no scroll cues, max one marquee, one accent color
- WCAG AA contrast on every CTA/label; focus-visible rings
- `prefers-reduced-motion`: every effect degrades to opacity-only or static
- Only `transform`/`opacity` animated; no `window.addEventListener("scroll")`
- Single nav line at desktop, nav height ≤ 72px, hero fits viewport (`min-h-[100dvh]`)
- Explicit mobile collapse for every section; type scale clamps on small screens

## 8. Build order

1. `index.html` (fonts, meta, title) + `global.css` (tokens, base, effects layer)
2. Shared primitives (magnetic button, reveal wrapper, spotlight surface)
3. Hero + nav
4. Marquee + Projects (sticky stack)
5. Experience + Skills + Education
6. Contact + footer
7. Wire App, delete dead files, `tsc` + build, visual pass in browser

## 9. Open questions (answer these and I build)

1. **Aesthetic direction**: (a) dark refined-tech with emerald accent, (b) dark with electric-blue accent + more glass, (c) light editorial minimal
2. **Motion boldness**: cinematic as specced above, or one notch subtler
3. **Intro preloader**: short branded load curtain (name reveal, ~1.2s), or straight into the hero
