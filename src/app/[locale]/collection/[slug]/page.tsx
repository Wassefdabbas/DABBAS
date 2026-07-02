import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLocale,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Accordion } from "@/components/accordion";
import { MagneticButton } from "@/components/motion";
import {
  getVeil,
  getCompleteYourLook,
  getYouMayAlsoLike,
  getAllSlugs,
  pickL,
} from "@/lib/collection";
import { routing, type Locale } from "@/i18n/routing";
import { DetailGallery } from "./_components/detail-gallery";
import { RelatedRow } from "./_components/related-row";

/* Static generation — every locale × slug combination.
   getAllSlugs() is async because Phase 7 it may read from Mongo. */
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const veil = await getVeil(slug);
  if (!veil) return { title: "DABBAS" };
  // The locale layout's title template appends "— DABBAS".
  return {
    title: pickL(veil.name, locale),
    description: pickL(veil.description, locale),
  };
}

export default async function VeilDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const veil = await getVeil(slug);
  if (!veil) notFound();

  const activeLocale = (await getLocale()) as Locale;
  const t = await getTranslations("Collection.detail");

  const [complete, similar] = await Promise.all([
    getCompleteYourLook(slug),
    getYouMayAlsoLike(slug),
  ]);

  const accordionItems = veil.details.map((d) => ({
    key: d.title.en, // stable key from EN title
    title: pickL(d.title, activeLocale),
    body: pickL(d.body, activeLocale),
  }));

  return (
    <main className="bg-porcelain">
      {/* Breadcrumb / back link */}
      <div className="px-6 pt-32 pb-6 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/collection"
            className="small-caps inline-flex items-center gap-3 !text-graphite transition-colors hover:!text-ink"
          >
            <span aria-hidden className="rtl:rotate-180">
              &larr;
            </span>
            {t("back")}
          </Link>
        </div>
      </div>

      {/* Main: gallery + info */}
      <section className="px-6 pb-32 sm:px-12 lg:px-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          {/* Gallery */}
          {(() => {
            const galleryImages = veil.gallery.length
              ? veil.gallery
              : [veil.cover];
            const thumbLabels = galleryImages.map((_, i) =>
              t("viewImage", { n: i + 1 }),
            );
            return (
              <DetailGallery
                images={galleryImages}
                thumbLabels={thumbLabels}
              />
            );
          })()}

          {/* Info column — sticky on desktop so the gallery scrolls past it */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="small-caps mb-4">{pickL(veil.lineLabel, activeLocale)}</p>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-ink">
              {pickL(veil.name, activeLocale)}
            </h1>

            {veil.price && (veil.price.en || veil.price.ar) && (
              <p className="mt-6 font-[family-name:var(--font-display)] text-xl text-gold-deep">
                {pickL(veil.price, activeLocale)}
              </p>
            )}

            <p className="mt-8 max-w-md text-base leading-relaxed text-graphite">
              {pickL(veil.description, activeLocale)}
            </p>

            <div className="mt-12">
              <h2 className="small-caps mb-2 !text-ink">{t("details")}</h2>
              <Accordion items={accordionItems} />
            </div>

            {/* Inline CTA */}
            <div className="mt-12">
              <Link href="/contact" className="focus:outline-none">
                <MagneticButton
                  type="button"
                  className="bg-ink px-8 py-4 text-porcelain transition-colors duration-300 hover:bg-gold-deep"
                  strength={0.3}
                  labelStrength={0.25}
                >
                  <span className="small-caps !text-current">
                    {t("bookCta")}
                  </span>
                  <span aria-hidden className="rtl:rotate-180">
                    &rarr;
                  </span>
                </MagneticButton>
              </Link>
              <p className="mt-4 max-w-sm text-sm text-muted">
                {t("bookSubhead")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related rows */}
      <div className="border-t border-mist bg-pearl">
        <RelatedRow
          title={t("completeYourLook")}
          veils={complete}
          locale={activeLocale}
        />
        <div className="hairline mx-auto max-w-7xl px-6 sm:px-12 lg:px-24" />
        <RelatedRow
          title={t("youMayAlsoLike")}
          veils={similar}
          locale={activeLocale}
        />
      </div>
    </main>
  );
}
