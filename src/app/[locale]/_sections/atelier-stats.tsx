import { getTranslations, getLocale } from "next-intl/server";
import { RevealText, Stagger } from "@/components/motion";

const STAT_KEYS = ["years", "brides", "handmade"] as const;

/**
 * Atelier stats — a centered editorial passage (title + two paragraphs) above
 * a row of three quiet stats. Light palette, gold only on the hairline + stat
 * values. Uses the shared RevealText / Stagger motion primitives.
 */
export async function AtelierStats() {
  const [t, locale] = await Promise.all([
    getTranslations("Home.stats"),
    getLocale(),
  ]);

  return (
    <section
      aria-label="The atelier"
      dir={locale === "ar" ? "rtl" : undefined}
      className="bg-porcelain px-6 py-28 sm:px-12 sm:py-36 lg:px-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="hairline mx-auto mb-12 w-16" />

        <RevealText
          as="h2"
          text={t("headline")}
          className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] text-ink"
        />

        {/* Mobile: a single short line. Desktop: the full two paragraphs. */}
        <p className="mt-8 text-base leading-relaxed text-graphite md:hidden">
          {t("para1Short")}
        </p>
        <RevealText
          as="p"
          text={t("para1")}
          className="mt-10 hidden text-base leading-relaxed text-graphite md:block"
          staggerChildren={0.02}
        />
      </div>

      {/* Stats row — stacked & generously spaced on mobile, 3-up from md */}
      <Stagger
        className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-14 border-t border-mist pt-14 sm:mt-20 md:grid-cols-3 md:gap-8 md:pt-16"
        staggerChildren={0.1}
      >
        {STAT_KEYS.map((key) => (
          <div key={key} className="text-center">
            <p className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,2.75rem)] leading-none text-gold-deep">
              {t(`items.${key}.value`)}
            </p>
            <p className="small-caps mt-4">{t(`items.${key}.label`)}</p>
          </div>
        ))}
      </Stagger>
    </section>
  );
}
