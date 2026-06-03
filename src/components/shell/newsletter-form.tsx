"use client";

import { useTranslations } from "next-intl";

/**
 * Placeholder newsletter form. No backend yet — Phase 6+ will wire it to a
 * real subscribe endpoint. Submitting just clears the input.
 */
export function NewsletterForm() {
  const t = useTranslations("Footer.newsletter");
  return (
    <form
      className="mt-2 flex border-b border-ink/20 focus-within:border-gold"
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLFormElement).reset();
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        {t("placeholder")}
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        placeholder={t("placeholder")}
        className="flex-1 bg-transparent py-2 text-graphite placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        className="small-caps !text-ink transition-colors hover:!text-gold-deep"
      >
        {t("submit")}
      </button>
    </form>
  );
}
