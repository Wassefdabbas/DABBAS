"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BrandImage } from "@/components/brand-image";
import type { BrandImage as BrandImageType } from "@/lib/images";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";

/**
 * Detail-page gallery — large primary image with a row of thumbnails.
 *
 * - Tap/click a thumbnail to swap the primary.
 * - Primary swap crossfades (instant for reduced motion).
 * - Thumbnails use a thin gold underline to show the active one.
 */
export function DetailGallery({
  images,
  thumbLabels,
}: {
  images: BrandImageType[];
  /** Pre-translated thumbnail labels, parallel to `images`. */
  thumbLabels: string[];
}) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const current = images[active];

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-mist">
        {/* popLayout: the incoming image starts its fade immediately instead
            of waiting out the exit (mode="wait" made every swap 2×0.6s).
            Both layers are absolutely positioned, so the "pop" is free. */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active}
            initial={reduced ? false : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={
              reduced
                ? undefined
                : { duration: 0.6, ease: easeOutExpo }
            }
            className="absolute inset-0"
          >
            <BrandImage
              image={current}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Gallery thumbnails"
          className="grid grid-cols-4 gap-3 sm:gap-4"
        >
          {images.map((img, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-label={thumbLabels[i]}
              onClick={() => setActive(i)}
              className={cn(
                "group relative aspect-[4/5] overflow-hidden bg-mist transition-opacity duration-300",
                i === active ? "opacity-100" : "opacity-70 hover:opacity-100",
              )}
            >
              <BrandImage
                image={img}
                sizes="(min-width: 1024px) 14vw, 25vw"
              />
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[2px] origin-center transition-transform duration-500 ease-[var(--ease-out-expo)] bg-gold",
                  i === active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
