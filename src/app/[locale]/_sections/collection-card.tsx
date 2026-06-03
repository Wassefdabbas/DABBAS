"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type CollectionCardData = {
  slug: string;
  /** Brand name — stays Latin/EN in both locales. */
  name: string;
  /** Localized one-line descriptor. */
  descriptor: string;
  src: string;
};

/**
 * One editorial collection card — full-bleed image with the name (always white)
 * overlaid on a bottom scrim. Desktop hover: the image darkens to a soft gray
 * and the descriptor fades in. No zoom. Transforms/opacity/color only.
 *
 * `mobile` drops hover behavior (touch surfaces show the descriptor at rest)
 * and is used inside the carousel.
 */
export function CollectionCard({
  card,
  mobile = false,
  sizes,
}: {
  card: CollectionCardData;
  mobile?: boolean;
  sizes: string;
}) {
  return (
    <Link
      href={`/collection/${card.slug}`}
      aria-label={`${card.name} — ${card.descriptor}`}
      className={cn(
        "group relative block overflow-hidden bg-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-0",
        // Mobile carousel = portrait 3:4; desktop grid = landscape 4:3
        mobile ? "aspect-[3/4]" : "aspect-[4/3]",
      )}
    >
      {/* Image — static, no zoom */}
      <Image
        src={card.src}
        alt={card.name}
        fill
        loading="lazy"
        sizes={sizes}
        className="object-cover"
      />

      {/* Bottom scrim — keeps the title legible over any image */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/55 to-transparent"
      />

      {/* Hover darken — image goes a touch darker / gray (desktop only) */}
      {!mobile && (
        <div
          aria-hidden
          className="absolute inset-0 bg-ink/0 transition-colors duration-500 ease-[var(--ease-out-expo)] group-hover:bg-ink/40"
        />
      )}

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <h3
          className={cn(
            "font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.2em] !text-white sm:text-4xl",
            "rtl:tracking-normal",
          )}
        >
          {card.name}
        </h3>
        <p
          className={cn(
            "mt-2 max-w-xs text-sm leading-relaxed text-white/80",
            // Mobile: always visible. Desktop: hidden at rest, fades in on hover.
            !mobile &&
              "translate-y-1.5 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          {card.descriptor}
        </p>
      </div>
    </Link>
  );
}
