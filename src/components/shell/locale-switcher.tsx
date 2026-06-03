"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * Inline AR / EN pill. Renders both labels; the inactive one is a link to the
 * same pathname under the other locale.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Locale");
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const swap = (next: Locale) => {
    if (next === current) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      // Inherits currentColor from its surroundings (the header inverts
      // light↔dark on scroll); the active label is emphasised, the other muted,
      // both via opacity so the colour itself can transition with the header.
      className={cn(
        "flex items-center gap-2 text-[0.8125rem] font-medium uppercase tracking-[0.16em]",
        className,
      )}
    >
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => swap(locale)}
            aria-current={locale === current ? "true" : undefined}
            className={cn(
              "uppercase transition-opacity duration-300",
              locale === current ? "opacity-100" : "opacity-50 hover:opacity-100",
            )}
          >
            {locale}
          </button>
          {i === 0 && (
            <span aria-hidden className="opacity-40">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
