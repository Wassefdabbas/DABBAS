# DABBAS Atelier — Engineering & Design Constitution

You are building the website for **DABBAS Atelier**, a luxury handmade wedding-veil and
bridal house. Read this file before every task. It governs all code and design decisions.

## Brand essence
- A quiet, opulent atelier. The feeling is *baroque luxury seen through soft daylight* —
  ivory, gilded edges, hand-craftsmanship, calm. Reference mood: MEDIOCRIS bridal.
- The product is the *veil*. Veils are sheer, weightless, slow-moving. Every interaction
  should feel like fabric settling — never snappy, never bouncy-cartoonish.
- Tone: editorial, confident, restrained. Storytelling over selling. No checkout.
  The single conversion goal is **Book an Appointment**.

## Design tokens (use CSS variables; never hardcode hex elsewhere)
```css
:root {
  /* Surfaces — the three brand off-whites */
  --porcelain: #FDFCFA;   /* primary page background */
  --pearl:     #F8FBF8;   /* alt sections */
  --mist:      #EAEDF0;   /* cards / dividers / cool neutral */

  /* Ink */
  --ink:       #1C1A17;   /* near-black warm, headings */
  --graphite:  #4A453E;   /* body text */
  --muted:     #8A8378;   /* captions, meta */

  /* Gold accent — used SPARINGLY: hairlines, active states, CTA, small caps */
  --gold:      #B79257;
  --gold-soft: #D9C39A;
  --gold-deep: #8C6A38;
}
```
Gold rule: if more than ~5% of any viewport is gold, it's too much. Gold is jewelry, not paint.

## Typography
- **Display / Headings:** an elegant high-contrast serif (use `Cormorant Garamond` or
  `Playfair Display` via next/font). Large, airy, generous letter-spacing on small-caps.
- **Body:** a clean humanist sans (`Inter` or `Geist`) at comfortable reading size.
- **Accent:** sparse small-caps with `letter-spacing: 0.2em` for labels (NEW ARRIVALS, etc).
- Arabic: load a matching elegant Arabic serif (`Amiri` or `Noto Naskh Arabic`).
  Mirror layout fully under `dir="rtl"`.

## Animation principles (Emil Kowalski school — follow strictly)
1. **Spring, not duration, for anything interactive.** Use Motion springs.
   Default feel: `{ type: "spring", stiffness: 200, damping: 30 }`. Soften (lower stiffness,
   higher damping) for large/heavy elements like the hero veil.
2. **Interruptible.** Never block input during animation. No janky `pointer-events:none`
   gates unless truly modal.
3. **Easing for non-spring (scroll, opacity reveals):** custom cubic-bezier, never linear,
   never the default `ease`. Use `[0.22, 1, 0.36, 1]` (expo-out) for entrances.
4. **Stagger reveals** of grouped items by 60–90ms. Subtle.
5. **Respect `prefers-reduced-motion`** — provide instant, non-animated fallbacks. Required.
6. **Transform & opacity only** for 60fps. Never animate layout/`width`/`top`.
7. **Motion should feel like fabric:** slow settle, slight overshoot at most. Nothing
   should "pop." Durations for reveals 0.7–1.1s, not 0.3s.
8. **Smooth scroll** via Lenis, synced to GSAP ScrollTrigger.

## Signature interactions to build (the "storytelling")
- **Hero:** a full-bleed bridal image; the veil/translucent layer drifts on a slow parallax
  as you scroll. A serif wordmark and a single line of script settle in on load.
- **Scroll-scrubbed sections:** GSAP ScrollTrigger pins a section and reveals copy + image
  as the user scrolls through it (like a slow camera move). Use for the "Our Craft" story.
- **Text reveals:** SplitType per-word, masked (translateY from below a clip), staggered.
- **Image reveals:** scale from 1.08 → 1.0 with a clip-path mask wipe on enter-view.
- **Magnetic / cursor-aware CTA** on "Book an Appointment" (subtle, desktop only).
- **Collection carousel:** Embla, soft drag inertia, peeking adjacent slides.

## Accessibility & quality
- Semantic HTML, alt text on every image, focus-visible rings (gold), WCAG AA contrast
  (note: pale-on-pale fails — body text must be `--graphite`/`--ink`, not gold).
- Fully responsive, mobile-first. Test 375 / 768 / 1440.
- Bilingual AR/EN with next-intl, full RTL mirroring.
- next/image for everything (Cloudinary loader). Lazy-load below the fold.
- Lighthouse target: 90+ perf, 100 a11y.

## Code conventions
- TypeScript strict. App Router, Server Components by default; `"use client"` only where
  animation/interactivity needs it.
- Animation primitives live in `src/components/motion/` (reusable: `<RevealText>`,
  `<RevealImage>`, `<Parallax>`, `<Stagger>`). Build these once, reuse everywhere.
- Tailwind for layout; CSS vars for color/type tokens. `cn()` helper (clsx+twMerge).
- Keep it DRY. Don't repeat animation config — centralize in `src/lib/motion.ts`.

## What NOT to do
- No generic AI-template look (no purple gradients, no glassmorphism, no emoji in UI).
- No bouncy/playful springs. No fast 200ms transitions. No carousels that auto-rotate fast.
- No gold floods. No drop shadows heavier than a whisper.
- Don't build a checkout. Don't add features not in BUILD.md without asking.