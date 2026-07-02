import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Parallax, RevealImage, RevealText } from "@/components/motion";
import { PaintedTile } from "@/components/painted-tile";
import { BrandMedia } from "@/components/brand-media";
import { getSiteContent } from "@/lib/site-content";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  // The locale layout's title template appends "— DABBAS".
  return {
    title: t("headline"),
    description: t("lead"),
  };
}

const sectionKeys = ["firstCut", "familyHouse", "materials", "signed"] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const site = await getSiteContent();

  return (
    <main className="bg-porcelain">
      {/* ── Hero band ────────────────────────────────────────── */}
      <header className="px-6 pt-40 pb-24 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="small-caps mb-6">{t("eyebrow")}</p>
          <RevealText
            as="h1"
            text={t("headline")}
            className="font-[family-name:var(--font-display)] text-[clamp(3rem,9vw,7rem)] leading-[0.95] text-ink"
          />
          <RevealText
            as="p"
            text={t("lead")}
            className="mt-10 max-w-xl text-lg leading-relaxed text-graphite"
            staggerChildren={0.04}
          />
          <div className="hairline mt-16 w-24" />
        </div>
      </header>

      {/* ── Editorial image break ────────────────────────────── */}
      <section className="px-6 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <RevealImage className="aspect-[16/9] w-full">
            <Parallax speed={0.2} className="h-full w-full">
              <BrandMedia
                media={site.aboutBreak}
                sizes="(min-width: 1024px) 1024px, 100vw"
                fallback={<PaintedTile variant="atelier" />}
              />
            </Parallax>
          </RevealImage>
        </div>
      </section>

      {/* ── Story sections ───────────────────────────────────── */}
      <section className="px-6 py-32 sm:px-12 sm:py-40 lg:px-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-16 md:gap-24">
          {sectionKeys.map((key, i) => (
            <article
              key={key}
              className="flex flex-col gap-y-2 md:grid md:grid-cols-[120px_1fr] md:items-baseline md:gap-x-8 md:gap-y-0"
            >
              <p
                aria-hidden
                className="small-caps text-muted/70 tabular-nums"
              >
                0{i + 1}
              </p>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,3vw,2rem)] leading-[1.15] text-ink">
                  {t(`sections.${key}.title`)}
                </h2>
                {/* Mobile: plain, trimmed to ~3 lines. Desktop: full animated. */}
                <p className="mt-3 text-base leading-relaxed text-graphite line-clamp-3 md:hidden">
                  {t(`sections.${key}.body`)}
                </p>
                <RevealText
                  as="p"
                  text={t(`sections.${key}.body`)}
                  className="mt-5 hidden text-base leading-relaxed text-graphite md:block"
                  staggerChildren={0.025}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="px-6 pb-40 sm:px-12 lg:px-24">
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
