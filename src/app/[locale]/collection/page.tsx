import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { RevealText } from "@/components/motion";
import { getVeils, pickL } from "@/lib/collection";
import { getCategories } from "@/lib/categories";
import type { Locale } from "@/i18n/routing";
import { CollectionGrid } from "./collection-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Collection.index" });
  // The locale layout's title template appends "— DABBAS".
  return {
    title: t("eyebrow"),
    description: t("blurb"),
  };
}

export default async function CollectionIndex({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Collection.index");
  const activeLocale = (await getLocale()) as Locale;
  const [veils, categories] = await Promise.all([getVeils(), getCategories()]);

  const items = veils.map((veil) => ({
    slug: veil.slug,
    name: pickL(veil.name, activeLocale),
    lineLabel: pickL(veil.lineLabel, activeLocale),
    cover: veil.cover,
    // The "next image" shown on hover — the veil's second image, if any.
    hover: veil.gallery?.[0] ?? null,
    categorySlug: veil.categorySlug ?? null,
  }));

  const filterCategories = categories.map((c) => ({
    slug: c.slug,
    name: pickL(c.name, activeLocale),
  }));

  return (
    <main className="bg-porcelain">
      {/* Header band */}
      <header className="px-6 pt-40 pb-20 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="small-caps mb-5">{t("eyebrow")}</p>
          <RevealText
            as="h1"
            text={t("headline")}
            className="font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,6rem)] leading-[0.95] text-ink"
          />
          <p className="mt-8 max-w-xl text-lg text-graphite">{t("blurb")}</p>
          <div className="hairline mt-16 w-24" />
        </div>
      </header>

      {/* Grid + luxury filter */}
      <section className="px-6 pb-32 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <CollectionGrid items={items} categories={filterCategories} />
        </div>
      </section>
    </main>
  );
}
