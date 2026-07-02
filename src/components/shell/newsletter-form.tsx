"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Newsletter form. No backend yet — Phase 6+ will wire it to a real
 * subscribe endpoint. Submitting shows a quiet inline thank-you in place
 * of the form (role="status" so screen readers announce it).
 */
export function NewsletterForm() {
  const t = useTranslations("Footer.newsletter");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p role="status" className="mt-2 border-b border-gold/60 py-2 text-graphite">
        {t("thanks")}
      </p>
    );
  }

  return (
    <form
      className="mt-2 flex border-b border-ink/20 focus-within:border-gold"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        {t("placeholder")}
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
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
