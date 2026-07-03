"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import { ScrollScene } from "@/components/motion";
import { BrandImage } from "@/components/brand-image";
import type { MediaImage } from "@/lib/site-content";

function CraftScene({
  progress,
  media,
}: {
  progress: MotionValue<number>;
  media: MediaImage | null;
}) {
  // Camera move: image starts wide & slightly off-center, pulls into a tight,
  // centered hold as progress goes 0 -> 1. Copy fades in and lifts; the
  // vignette deepens to keep the text legible.
  //
  // Scroll budget (Phase 3): the scene is 200vh (100vh of pinned scrub).
  // Beats fill 0 -> 0.8 of the scrub; [0.8, 1] is a short settled breath
  // before the pin releases — the old 260vh version idled for its last 30%.
  const imageScale = useTransform(progress, [0, 1], [1.18, 1.0]);
  const imageShiftY = useTransform(progress, [0, 1], ["6%", "-4%"]);
  const overlay = useTransform(progress, [0, 0.55, 0.9], [0.15, 0.45, 0.55]);

  const eyebrowOpacity = useTransform(progress, [0, 0.22], [0, 1]);
  const headlineY = useTransform(progress, [0.12, 0.58], [40, 0]);
  const headlineOpacity = useTransform(progress, [0.12, 0.48], [0, 1]);
  const bodyOpacity = useTransform(progress, [0.45, 0.75], [0, 1]);
  const bodyY = useTransform(progress, [0.45, 0.8], [24, 0]);

  const t = useTranslations("Home.craft");
  const locale = useLocale();

  return (
    <div className="relative h-screen w-full">
      <motion.div
        style={{ scale: imageScale, y: imageShiftY }}
        className="absolute inset-0 origin-center will-change-transform"
      >
        {media ? (
          <BrandImage image={media.image} sizes="100vw" className="object-cover" />
        ) : (
          <Image
            src="/hero/ourcraft.png"
            alt="Hands finishing a veil edge at the DABBAS atelier"
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
      </motion.div>

      <motion.div
        aria-hidden
        style={{ opacity: overlay }}
        className="absolute inset-0"
        // Dark vignette from the bottom — keeps copy readable
        // even when the placeholder palette is bright.
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(28,26,23,0.10) 0%, rgba(28,26,23,0.85) 100%)",
          }}
        />
      </motion.div>

      <div dir={locale === "ar" ? "rtl" : undefined} className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-24 sm:px-12 sm:pb-32 lg:px-24">
        <motion.p
          style={{ opacity: eyebrowOpacity }}
          className="small-caps !text-porcelain/85"
        >
          {t("eyebrow")}
        </motion.p>

        <motion.h2
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] !text-porcelain will-change-transform"
        >
          {t("headline")}
        </motion.h2>

        <motion.p
          style={{ y: bodyY, opacity: bodyOpacity }}
          className="mt-6 max-w-md text-base leading-relaxed text-porcelain/80 will-change-transform"
        >
          {t("body")}
        </motion.p>
      </div>
    </div>
  );
}

/**
 * "Our Craft" — pinned scroll-scrubbed scene. Image performs a slow camera
 * push-in while eyebrow → headline → body reveal in sequence, all driven
 * by the same scroll progress. Media comes from the admin-editable site
 * content, falling back to the bundled still.
 */
export function OurCraft({ media }: { media: MediaImage | null }) {
  return (
    <section aria-label="Our Craft" className="bg-ink">
      <ScrollScene length="200vh">
        {(progress) => <CraftScene progress={progress} media={media} />}
      </ScrollScene>
    </section>
  );
}
