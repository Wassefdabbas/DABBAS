import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getLocale,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Accordion } from "@/components/accordion";
import {
  getVeil,
  getCompleteYourLook,
  getYouMayAlsoLike,
  getAllSlugs,
  pickL,
  SPEC_KEYS,
} from "@/lib/collection";
import { routing, type Locale } from "@/i18n/routing";
import { DetailGallery } from "./_components/detail-gallery";
import { RelatedRow } from "./_components/related-row";
import { VeilEnquireButton } from "./_components/veil-enquire-button";

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

  // Structured specs (material, lace, …) — only the ones the admin filled in,
  // in the canonical order. Rendered as a quiet definition list.
  type SpecItem = { key: string; label: string; value: string };
  const specItems = SPEC_KEYS.map((key): SpecItem | null => {
    const value = veil.specs?.[key];
    const text = value ? pickL(value, activeLocale).trim() : "";
    return text ? { key, label: t(`specs.${key}`), value: text } : null;
  }).filter((s): s is SpecItem => s !== null);

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
            // Show every image: the cover (image 1) first, then the rest.
            const galleryImages = [veil.cover, ...veil.gallery].filter(Boolean);
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

            {/* Details — structured specs the admin fills in (material, lace, …) */}
            {specItems.length > 0 && (
              <div className="mt-10">
                <h2 className="small-caps mb-4 !text-ink">{t("details")}</h2>
                <dl className="border-y border-mist">
                  {specItems.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-baseline justify-between gap-6 border-b border-mist py-3 last:border-b-0"
                    >
                      <dt className="small-caps shrink-0">{s.label}</dt>
                      <dd className="text-end text-sm leading-relaxed text-graphite">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Optional legacy accordion detail items (from Advanced settings) */}
            {accordionItems.length > 0 && (
              <div className="mt-10">
                <Accordion items={accordionItems} />
              </div>
            )}

            {/* Short description */}
            <p className="mt-10 max-w-md text-base leading-relaxed text-graphite">
              {pickL(veil.description, activeLocale)}
            </p>

            {/* CTAs — Book an Appointment (primary, → booking page) and
                Inquire About This Veil (secondary, → WhatsApp) */}
            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-ink px-8 py-4 !text-porcelain transition-colors duration-300 hover:bg-gold-deep"
              >
                <span className="small-caps !text-current">{t("bookCta")}</span>
                <span aria-hidden className="rtl:rotate-180">
                  &rarr;
                </span>
              </Link>
              <VeilEnquireButton
                veilName={pickL(veil.name, activeLocale)}
                variant="secondary"
              />
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted">
              {t("bookSubhead")}
            </p>
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
