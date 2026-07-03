import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLocale,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealText } from "@/components/motion";
import { getVeilsByCategory, pickL } from "@/lib/collection";
import { getCategories } from "@/lib/categories";
import { routing, type Locale } from "@/i18n/routing";
import { CollectionGrid } from "../../collection-grid";

/* Static generation — every locale × category. New admin-created categories
   are rendered on demand (dynamicParams default). */
export async function generateStaticParams() {
  const categories = await getCategories();
  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, slug: c.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "DABBAS" };
  const t = await getTranslations({ locale, namespace: "Collection.category" });
  // The locale layout's title template appends "— DABBAS".
  return {
    title: pickL(category.name, locale),
    description: t.has(`blurbs.${slug}`) ? t(`blurbs.${slug}`) : undefined,
  };
}

/**
 * Category landing — the missing step between the homepage line tiles and
 * the product grid. Same editorial header grammar as the collection index
 * (eyebrow / display-serif h1 / lead / hairline) but with curated per-line
 * copy, a piece count, and a breadcrumb back to all veils, so it reads as
 * a chapter of the collection rather than a re-skin of it.
 */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [categories, veils] = await Promise.all([
    getCategories(),
    getVeilsByCategory(slug),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const activeLocale = (await getLocale()) as Locale;
  const t = await getTranslations("Collection.category");

  const items = veils.map((veil) => ({
    slug: veil.slug,
    name: pickL(veil.name, activeLocale),
    lineLabel: pickL(veil.lineLabel, activeLocale),
    cover: veil.cover,
    // The "next image" shown on hover — the veil's second image, if any.
    hover: veil.gallery?.[0] ?? null,
    categorySlug: veil.categorySlug ?? null,
  }));

  const blurb = t.has(`blurbs.${slug}`) ? t(`blurbs.${slug}`) : null;
  // Made-to-order lines (bespoke) carry a line-specific empty note instead
  // of the generic "no veils yet".
  const emptyText = t.has(`empties.${slug}`) ? t(`empties.${slug}`) : undefined;

  return (
    <main className="bg-porcelain">
      {/* ── Header band ──────────────────────────────────────── */}
      <header className="px-6 pt-32 pb-20 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb back to the full collection */}
          <Link
            href="/collection"
            className="small-caps inline-flex items-center gap-3 !text-graphite transition-colors hover:!text-ink"
          >
            <span aria-hidden className="rtl:rotate-180">
              &larr;
            </span>
            {t("all")}
          </Link>

          <p className="small-caps mt-12 mb-5">{t("eyebrow")}</p>
          <RevealText
            as="h1"
            text={pickL(category.name, activeLocale)}
            className="font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,6rem)] leading-[0.95] text-ink"
          />
          {blurb && (
            <RevealText
              as="p"
              text={blurb}
              className="mt-8 max-w-xl text-lg leading-relaxed text-graphite"
              staggerChildren={0.04}
            />
          )}
          {items.length > 0 && (
            <p className="small-caps mt-8">
              {t("count", { count: items.length })}
            </p>
          )}
          <div className="hairline mt-16 w-24" />
        </div>
      </header>

      {/* ── Grid — same component as the index, no filter UI ──── */}
      <section className="px-6 pb-24 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-[1600px]">
          <CollectionGrid items={items} categories={[]} emptyText={emptyText} />
        </div>
      </section>

      {/* ── Closing CTA — carries the page for made-to-order lines ── */}
      <section className="px-6 pb-32 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hairline mx-auto mb-12 w-24" />
          <Link
            href="/contact"
            className="small-caps inline-flex items-center gap-3 border-b border-gold pb-1 !text-ink transition-colors hover:!text-gold-deep"
          >
            {t("cta")}
            <span aria-hidden className="rtl:rotate-180">
              &rarr;
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
