"use client";

import { Link } from "@/i18n/navigation";
import { BrandImage } from "@/components/brand-image";
import type { BrandImage as BrandImageData } from "@/lib/images";

/**
 * One Featured Veils tile. Shows the cover image; on hover it crossfades to the
 * veil's next image (first gallery shot), falling back to the cover if the veil
 * has no gallery. Opacity-only crossfade — 60fps, reduced-motion safe (the
 * global kill-switch collapses the transition).
 */
export function FeaturedCard({
  slug,
  name,
  lineLabel,
  cover,
  hover,
  sizes,
}: {
  slug: string;
  name: string;
  lineLabel: string;
  cover: BrandImageData;
  /** Next image revealed on hover; null = no second image (no swap). */
  hover: BrandImageData | null;
  sizes: string;
}) {
  return (
    <Link
      href={`/collection/${slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-mist">
        {/* Cover — fades out on hover when a second image exists */}
        <div
          className={
            hover
              ? "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-0"
              : "absolute inset-0"
          }
        >
          <BrandImage image={cover} sizes={sizes} className="object-cover" />
        </div>

        {/* Next image — fades in on hover */}
        {hover && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-100">
            <BrandImage image={hover} sizes={sizes} className="object-cover" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 text-center">
        <h3 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
          {name}
        </h3>
        <p className="small-caps">{lineLabel}</p>
      </div>
    </Link>
  );
}
