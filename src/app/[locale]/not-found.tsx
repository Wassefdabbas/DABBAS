import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Localized 404 — caught by `notFound()` inside the [locale] tree. The root
 * 404 (src/app/not-found.tsx) handles requests outside any locale.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="small-caps mb-6">{t("eyebrow")}</p>
      <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,5rem)] leading-[1.05] text-ink">
        {t("headline")}
      </h1>
      <p className="mt-8 max-w-md text-graphite">{t("body")}</p>
      <Link
        href="/"
        className="small-caps mt-12 inline-flex items-center gap-3 border-b border-gold pb-1 !text-ink transition-colors hover:!text-gold-deep"
      >
        {t("cta")}
        <span aria-hidden className="rtl:rotate-180">
          &rarr;
        </span>
      </Link>
    </main>
  );
}
