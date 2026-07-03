import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Stagger } from "@/components/motion";
import { getFeaturedVeils, pickL } from "@/lib/collection";
import { getSiteContent } from "@/lib/site-content";
import type { Locale } from "@/i18n/routing";
import { FeaturedCard } from "./featured-card";

/**
 * Featured Veils — exactly 4 veils chosen by the admin in /admin/site.
 * Falls back to the first 4 veils by DB order if none are configured.
 * Cards are image-only (no name/label), in a 2×2 tight grid that matches
 * the collection page's editorial aesthetic.
 */
export async function FeaturedVeils() {
  const [t, locale, site] = await Promise.all([
    getTranslations("Home.featured"),
    getLocale() as Promise<Locale>,
    getSiteContent(),
  ]);

  const veils = await getFeaturedVeils(site.featuredSlugs);

  const items = veils.map((v) => ({
    slug: v.slug,
    name: pickL(v.name, locale),
    lineLabel: pickL(v.lineLabel, locale),
    cover: v.cover,
    hover: v.gallery?.[0] ?? null,
  }));

  if (items.length === 0) return null;

  return (
    <section aria-label="Featured veils" className="bg-porcelain py-28 sm:py-36">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        {/* Title */}
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] text-ink">
            {t("eyebrow")}
          </h2>
        </div>

        {/* 2×2 tight grid — image-only cards, collection-page gap */}
        <Stagger
          className="grid grid-cols-2 gap-[2px]"
          staggerChildren={0.08}
        >
          {items.map((item) => (
            <FeaturedCard
              key={item.slug}
              slug={item.slug}
              name={item.name}
              lineLabel={item.lineLabel}
              cover={item.cover}
              hover={item.hover}
              sizes="(min-width: 1024px) 50vw, 50vw"
            />
          ))}
        </Stagger>

        {/* See all */}
        <div className="mt-10 flex justify-center sm:mt-14">
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
