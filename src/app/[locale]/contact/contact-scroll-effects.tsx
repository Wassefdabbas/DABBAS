"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

// ScrollTrigger is registered once in SmoothScrollProvider — never here.

/**
 * Mounts with zero DOM output. On the client it wires up:
 *  1. Tonal background morph across section boundaries (scrub)
 *  2. Thread-pull scaleX divider reveals
 *  3. Staggered eyebrow + headline entrance reveals
 *  4. SVG stroke-dashoffset line-draw on contact card icons
 *  5. Submit button settle-in (scale + opacity)
 *
 * All effects respect prefers-reduced-motion and are reverted on unmount.
 */
export function ContactScrollEffects() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const isRtl = document.documentElement.dir === "rtl";

    const ctx = gsap.context(() => {
      // ── 1. Section background tones + smooth morph on scroll ────
      // Sections start at the PREVIOUS section's colour; ScrollTrigger
      // scrubs them to their own tone as they enter the viewport.
      const SECTION_BG = {
        hero:   "#FAF8F4",
        form:   "#F7F3ED",
        direct: "#F3EFE8",
        visit:  "#EEF0EA",
      } as const;

      const hero   = document.getElementById("contact-hero");
      const form   = document.getElementById("contact-form");
      const direct = document.getElementById("contact-direct");
      const visit  = document.getElementById("contact-visit");

      // Initialise: hero = own colour, rest start at the previous colour
      if (hero)   gsap.set(hero,   { backgroundColor: SECTION_BG.hero });
      if (form)   gsap.set(form,   { backgroundColor: SECTION_BG.hero });
      if (direct) gsap.set(direct, { backgroundColor: SECTION_BG.form });
      if (visit)  gsap.set(visit,  { backgroundColor: SECTION_BG.direct });

      [
        { el: form,   bg: SECTION_BG.form },
        { el: direct, bg: SECTION_BG.direct },
        { el: visit,  bg: SECTION_BG.visit },
      ].forEach(({ el, bg }) => {
        if (!el) return;
        gsap.to(el, {
          backgroundColor: bg,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "top 35%",
            scrub: true,
          },
        });
      });

      // ── 2. Thread-pull dividers — scaleX left→right (mirror for RTL) ──
      document
        .querySelectorAll<HTMLElement>("[data-divider]")
        .forEach((el) => {
          gsap.fromTo(
            el,
            {
              scaleX: 0,
              transformOrigin: isRtl ? "right center" : "left center",
            },
            {
              scaleX: 1,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                toggleActions: "play none none none",
              },
            },
          );
        });

      // ── 3. Staggered eyebrow + headline reveals ──────────────────
      document
        .querySelectorAll<HTMLElement>("[data-eyebrow]")
        .forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        });

      document
        .querySelectorAll<HTMLElement>("[data-headline]")
        .forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              delay: 0.12,
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        });

      // ── 4. SVG icon line-draw (stroke-dashoffset) ────────────────
      document
        .querySelectorAll<SVGSVGElement>("[data-draw-icon]")
        .forEach((svg) => {
          const paths = svg.querySelectorAll<SVGGeometryElement>("path, rect");
          paths.forEach((shape, i) => {
            const len = shape.getTotalLength();
            gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
            gsap.to(shape, {
              strokeDashoffset: 0,
              duration: 0.5,
              ease: "power2.out",
              delay: i * 0.1,
              scrollTrigger: {
                trigger: svg,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            });
          });
        });

      // ── 5. Submit button settle-in ───────────────────────────────
      const btn = document.querySelector<HTMLElement>("[data-submit-btn]");
      if (btn) {
        gsap.fromTo(
          btn,
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: btn,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    });

    return () => ctx.revert();
  }, [reduced]);

  return null;
}
