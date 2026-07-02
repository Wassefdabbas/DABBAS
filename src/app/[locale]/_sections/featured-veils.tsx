import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Stagger } from "@/components/motion";
import { getFeaturedVeils, pickL } from "@/lib/collection";
import type { Locale } from "@/i18n/routing";
import { FeaturedCard } from "./featured-card";

const GRID_COUNT = 8; // at most 2 rows × 4 columns

/**
 * Featured Veils — a centered editorial grid: up to 8 cards in 4 columns
 * (responsive: 2 cols on small screens). Each card is a 3:4 portrait image
 * with the veil name + line label below, linking to its detail page.
 *
 * The grid shows only real veils — never repeats to fill rows (each piece
 * is one of a kind; seeing it twice reads as an error) and never pads with
 * placeholders (an atelier with few pieces is scarcity, not emptiness).
 * A ragged last row is fine — editorial grids carry it.
 *
 * Strings + data are resolved server-side so the page stays statically
 * rendered per locale.
 */
export async function FeaturedVeils() {
  const t = await getTranslations("Home.featured");
  const locale = (await getLocale()) as Locale;
  const veils = await getFeaturedVeils(GRID_COUNT);

  const items = veils.map((v) => ({
    slug: v.slug,
    key: v.slug,
    name: pickL(v.name, locale),
    lineLabel: pickL(v.lineLabel, locale),
    cover: v.cover,
    // The "next image" shown on hover — first gallery shot, if any.
    hover: v.gallery?.[0] ?? null,
  }));

  // Nothing to feature → no section (never an empty frame).
  if (items.length === 0) return null;

  return (
    <section aria-label="Featured veils" className="bg-porcelain py-28 sm:py-36">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        {/* Title — centered, enlarged (headline line removed) */}
        <Stagger
          className="mb-14 flex flex-col items-center gap-4 text-center sm:mb-20"
          staggerChildren={0.08}
        >
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] text-ink">
            {t("eyebrow")}
          </h2>
        </Stagger>

        {/* Centered 4×2 grid of 3:4 cards */}
        <Stagger
          className="mx-auto grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6 lg:gap-8"
          staggerChildren={0.08}
        >
          {items.map((item) => (
            <FeaturedCard
              key={item.key}
              slug={item.slug}
              name={item.name}
              lineLabel={item.lineLabel}
              cover={item.cover}
              hover={item.hover}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 23vw, 45vw"
            />
          ))}
        </Stagger>

        {/* See all */}
        <div className="mt-14 flex justify-center sm:mt-20">
          <Link
            href="/collection"
            className="small-caps inline-flex items-center gap-3 border-b border-gold pb-1 !text-ink transition-colors hover:!text-gold-deep"
          >
            {t("cta")}
            <span aria-hidden className="rtl:rotate-180">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
