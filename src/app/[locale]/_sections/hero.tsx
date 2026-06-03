"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { RevealText, RevealImage, Parallax } from "@/components/motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/cn";
import type { Media } from "@/lib/site-content";

/**
 * Hero.
 *
 * Desktop (≥768px): full-bleed bride image with a real liquid-glass panel over
 * the start ~48% — refraction + frost + edge lighting. Headline + subheading +
 * link sit on the glass in ink. (Unchanged.)
 *
 * Mobile (<768px): a clean STACKED layout — the image on top (~55svh), then a
 * solid porcelain block with the headline + link ONLY (no subheading). No glass,
 * no blur, no backdrop-filter on phones.
 *
 * Image is hardcoded to /public/hero/Herosection.png. The `media` prop is still
 * accepted (the homepage passes it) but ignored.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Hero({ media: _media }: { media: Media }) {
  const t = useTranslations("Home.hero");
  const reduced = useReducedMotion();
  // Desktop-only glass. Never renders below 768px (no GPU cost on phones).
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Layout is always LTR (Arabic swaps words, not direction), so the feather
  // always dissolves toward the end edge — same as English.
  const fade = "right";
  // A soft dark wash over the blurred left — enough for the WHITE copy to stay
  // legible, while the image still shows through and feathers to clear.
  const glassBackground = `linear-gradient(to ${fade}, color-mix(in srgb, var(--ink) 60%, transparent) 0%, color-mix(in srgb, var(--ink) 45%, transparent) 60%, color-mix(in srgb, var(--ink) 22%, transparent) 85%, transparent 100%)`;
  const glassMask = `linear-gradient(to ${fade}, #000 78%, transparent 100%)`;

  return (
    <section
      aria-label="Hero"
      className={cn(
        "relative w-full overflow-hidden bg-porcelain",
        // Mobile: stacked (image block + porcelain copy block) → natural height.
        // Desktop: full-bleed image with the glass overlay → full viewport.
        "flex flex-col md:block md:h-[100svh] md:min-h-[640px]",
      )}
    >
      {/* ── IMAGE ── mobile: a block on top (~55svh); desktop: full-bleed ── */}
      <RevealImage
        direction="bottom"
        reveal="mount"
        className="relative z-0 h-[55svh] w-full md:absolute md:inset-0 md:h-full"
      >
        <Parallax speed={0.15} className="h-full w-full">
          <div className="relative h-full w-full">
            <Image
              src="/hero/Herosection.png"
              alt="DABBAS Atelier — bride in handmade veil"
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover object-[60%_center]"
            />
          </div>
        </Parallax>
      </RevealImage>

      {/* ── BLUR PANEL — DESKTOP ONLY ─────────────────────────
          The full image shows; the left ~48% is simply blurred (frosted) behind
          the copy and feathers into the sharp right half — no refraction, no
          heavy tint, just a soft blur. Never mounts below 768px; settles in on
          load via opacity. */}
      {isDesktop && (
        <motion.div
          aria-hidden
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduced ? { duration: 0 } : { duration: 1, ease: [0.22, 1, 0.36, 1] }
          }
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-[48%]"
          style={{
            background: glassBackground,
            maskImage: glassMask,
            WebkitMaskImage: glassMask,
            WebkitBackdropFilter: "blur(20px)",
            backdropFilter: "blur(20px)",
          }}
        />
      )}

      {/* ── CONTENT ──
          Mobile: a solid porcelain block under the image — headline + link
          ONLY, centred, ink on ivory (no subheading). Desktop: ink copy
          (heading + subheading + link) vertically centred on the glass. */}
      <div
        className={cn(
          "relative z-20 bg-porcelain px-6 py-14 text-center sm:px-10",
          "md:flex md:h-full md:w-[48%] md:flex-col md:justify-center md:bg-transparent md:px-12 md:py-0 md:text-start lg:px-20",
        )}
      >
        <div>
          {/* Stacked headline */}
          <h1
            className={cn(
              "flex flex-col items-center uppercase md:items-start",
              "font-[family-name:var(--font-display)] font-semibold",
              "text-[clamp(2.5rem,4.6vw,4.5rem)] leading-[1.0] tracking-[0.02em] text-ink md:!text-porcelain",
              // Arabic: don't track or upper-case
              "rtl:tracking-normal rtl:font-normal rtl:normal-case",
            )}
          >
            <RevealText as="span" text={t("line1")} staggerChildren={0.08} />
            <RevealText
              as="span"
              text={t("line2")}
              staggerChildren={0.08}
              delay={0.1}
            />
            <RevealText
              as="span"
              text={t("line3")}
              staggerChildren={0.08}
              delay={0.2}
            />
          </h1>

          {/* Subheading — DESKTOP ONLY (hidden on mobile) */}
          <p className="mt-7 hidden max-w-[440px] text-base leading-relaxed text-porcelain/85 md:block">
            {t("subcopy")}
          </p>

          {/* CTA — one editorial text link with an animated gold underline */}
          <Link
            href="/collection"
            className={cn(
              "group mt-9 inline-flex w-fit items-center gap-3 pb-2",
              "text-[0.8125rem] font-medium uppercase tracking-[0.16em] !text-ink md:!text-porcelain",
            )}
          >
            <span className="relative">
              {t("viewCollection")}
              {/* Editorial base rule — a faint ink hairline at rest */}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-px bg-ink/25 md:bg-porcelain/40"
              />
              {/* Gold wipe — draws across from the leading edge on hover */}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-gold",
                  "transition-transform duration-[600ms] ease-[var(--ease-out-expo)]",
                  "group-hover:scale-x-100 rtl:origin-right",
                )}
              />
            </span>
            <span
              aria-hidden
              className={cn(
                "transition-transform duration-[600ms] ease-[var(--ease-out-expo)]",
                "group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1",
              )}
            >
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
