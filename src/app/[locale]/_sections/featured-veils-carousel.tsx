"use client";

import { useLocale } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@/i18n/navigation";
import { BrandImage } from "@/components/brand-image";
import { cn } from "@/lib/cn";
import type { BrandImage as BrandImageType } from "@/lib/images";

type Item = {
  slug: string;
  name: string;
  lineLabel: string;
  cover: BrandImageType;
};

export function FeaturedVeilsCarousel({ items }: { items: Item[] }) {
  const locale = useLocale();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    direction: locale === "ar" ? "rtl" : "ltr",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const lastIndex = items.length - 1;

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {items.map((item, i) => (
          <article
            key={item.slug}
            className={cn(
              "shrink-0",
              "basis-[78%] sm:basis-[44%] md:basis-[34%] lg:basis-[26%]",
              // ps = padding-inline-start, follows reading direction
              "ps-6 sm:ps-8",
              // First/last align with the container's outer insets
              i === 0 && "ps-6 sm:ps-12 lg:ps-24",
              i === lastIndex && "pe-6 sm:pe-12 lg:pe-24",
            )}
          >
            <Link
              href={`/collection/${item.slug}`}
              className="group block focus:outline-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-mist">
                <BrandImage
                  image={item.cover}
                  sizes="(min-width: 1024px) 26vw, (min-width: 768px) 34vw, (min-width: 640px) 44vw, 78vw"
                  className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
                {/* Hover veil */}
                <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink">
                  {item.name}
                </h3>
                <p className="small-caps">{item.lineLabel}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
