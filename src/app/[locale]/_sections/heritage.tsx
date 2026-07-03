"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import { Link } from "@/i18n/navigation";
import { ScrollScene } from "@/components/motion";
import { PaintedTile } from "@/components/painted-tile";
import { BrandMedia } from "@/components/brand-media";
import type { MediaImage } from "@/lib/site-content";

function HeritageScene({
  progress,
  media,
}: {
  progress: MotionValue<number>;
  media: MediaImage | null;
}) {
  const t = useTranslations("Home.heritage");
  const locale = useLocale();

  // The image drifts slowly upward inside its window and settles from a
  // slight zoom — an heirloom photograph being set down, not a camera move.
  const imageY = useTransform(progress, [0, 1], ["4%", "-3%"]);
  const imageScale = useTransform(progress, [0, 1], [1.1, 1]);

  // Copy beats: eyebrow → headline → body → CTA, filling 0 → 0.85 of the
  // scrub with a settled breath at the end (same grammar as OurCraft).
  const eyebrowOpacity = useTransform(progress, [0.05, 0.22], [0, 1]);
  const headlineY = useTransform(progress, [0.12, 0.5], [36, 0]);
  const headlineOpacity = useTransform(progress, [0.12, 0.42], [0, 1]);
  const bodyY = useTransform(progress, [0.38, 0.72], [24, 0]);
  const bodyOpacity = useTransform(progress, [0.38, 0.65], [0, 1]);
  const ctaOpacity = useTransform(progress, [0.68, 0.85], [0, 1]);
  // Keep the link out of hit-testing while it's still invisible.
  const ctaVisibility = useTransform(ctaOpacity, (o) =>
    o < 0.05 ? ("hidden" as const) : ("visible" as const),
  );

  return (
    <div className="flex h-screen w-full flex-col justify-center bg-pearl px-6 py-10 sm:px-12 lg:px-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-20">
        {/* Image window — overflow-hidden clips the slow drift */}
        <div className="relative h-[36svh] w-full overflow-hidden lg:h-[68svh]">
          <motion.div
            style={{ y: imageY, scale: imageScale }}
            className="absolute inset-0 will-change-transform"
          >
            <BrandMedia
              media={media}
              sizes="(min-width: 1024px) 50vw, 100vw"
              fallback={<PaintedTile variant="atelier" />}
            />
          </motion.div>
        </div>

        {/* Copy */}
        <div dir={locale === "ar" ? "rtl" : undefined}>
          <motion.p style={{ opacity: eyebrowOpacity }} className="small-caps mb-5">
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] text-ink will-change-transform"
          >
            {t("headline")}
          </motion.h2>
          <motion.p
            style={{ y: bodyY, opacity: bodyOpacity }}
            className="mt-6 max-w-md text-base leading-relaxed text-graphite will-change-transform"
          >
            {t("body")}
          </motion.p>
          <motion.div style={{ opacity: ctaOpacity, visibility: ctaVisibility }}>
            <Link
              href="/about"
              className="small-caps mt-10 inline-flex items-center gap-3 border-b border-gold pb-1 !text-ink transition-colors hover:!text-gold-deep"
            >
              {t("cta")}
              <span aria-hidden className="rtl:rotate-180">
                &rarr;
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/**
 * Heritage — "Damascus, since 1966" — pinned scroll-scrubbed scene, the
 * light counterpart to OurCraft's dark one. 180vh (80vh of pinned scrub):
 * fewer beats than the craft scene, so a shorter stay. Media comes from
 * the admin-editable site content (heritage slot).
 */
export function Heritage({ media }: { media: MediaImage | null }) {
  return (
    <section aria-label="Heritage" className="bg-pearl">
      <ScrollScene length="180vh">
        {(progress) => <HeritageScene progress={progress} media={media} />}
      </ScrollScene>
    </section>
  );
}
