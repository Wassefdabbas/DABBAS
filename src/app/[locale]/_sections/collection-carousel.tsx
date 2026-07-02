"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useLocale } from "next-intl";
import { CollectionCard, type CollectionCardData } from "./collection-card";

/**
 * Mobile-only horizontal carousel — one portrait card with a peek of the next,
 * soft drag inertia, no auto-rotate, no arrows, no dots. Hidden ≥768px
 * (the grid takes over).
 */
export function CollectionCarousel({ cards }: { cards: CollectionCardData[] }) {
  const locale = useLocale();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    // Embla doesn't read the DOM dir attribute — it must be told.
    direction: locale === "ar" ? "rtl" : "ltr",
    dragFree: false,
    containScroll: "trimSnaps",
  });

  return (
    <div className="md:hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Edge insets live on the track (ps/pe), so EVERY slide keeps the same
            width + gap — first/last are no longer narrower than the middle. */}
        <div className="flex touch-pan-y ps-6 pe-6">
          {cards.map((card) => (
            <div
              key={card.slug}
              className="min-w-0 shrink-0 basis-[82%] pe-2"
            >
              <CollectionCard card={card} mobile sizes="82vw" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
