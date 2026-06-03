"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useTransform, type MotionValue } from "motion/react";
import { ScrollScene } from "@/components/motion";
import type { MediaImage } from "@/lib/site-content";

function CraftScene({ progress }: { progress: MotionValue<number> }) {
  // Camera move: image starts wide & slightly off-center, pulls into a tight,
  // centered hold as progress goes 0 -> 1. Copy fades in and lifts; the
  // vignette deepens to keep the text legible.
  const imageScale = useTransform(progress, [0, 1], [1.18, 1.0]);
  const imageShiftY = useTransform(progress, [0, 1], ["6%", "-4%"]);
  const overlay = useTransform(progress, [0, 0.55, 1], [0.15, 0.45, 0.55]);

  const eyebrowOpacity = useTransform(progress, [0, 0.2, 0.9, 1], [0, 1, 1, 0.85]);
  const headlineY = useTransform(progress, [0.1, 0.6], [40, 0]);
  const headlineOpacity = useTransform(progress, [0.1, 0.45], [0, 1]);
  const bodyOpacity = useTransform(progress, [0.4, 0.7], [0, 1]);
  const bodyY = useTransform(progress, [0.4, 0.7], [24, 0]);

  const t = useTranslations("Home.craft");

  return (
    <div className="relative h-screen w-full">
      <motion.div
        style={{ scale: imageScale, y: imageShiftY }}
        className="absolute inset-0 origin-center will-change-transform"
      >
        <Image
          src="/hero/ourcraft.png"
          alt="Hands finishing a veil edge at the DABBAS atelier"
          fill
          sizes="100vw"
          className="object-cover"
        />
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

      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-24 sm:px-12 sm:pb-32 lg:px-24">
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
 * by the same scroll progress.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function OurCraft({ media: _media }: { media: MediaImage | null }) {
  return (
    <section aria-label="Our Craft" className="bg-ink">
      <ScrollScene length="260vh">
        {(progress) => <CraftScene progress={progress} />}
      </ScrollScene>
    </section>
  );
}
