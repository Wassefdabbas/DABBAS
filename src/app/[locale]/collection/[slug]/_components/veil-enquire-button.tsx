"use client";

import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/motion";

const WA_NUMBER = "963934067735";

/**
 * Flow 2 — veil detail page CTA.
 * Opens WhatsApp directly with the veil name + current page URL pre-filled.
 * No form, no dashboard write — pure client redirect.
 */
export function VeilEnquireButton({ veilName }: { veilName: string }) {
  const t = useTranslations("Collection.detail");

  const handleClick = () => {
    const url = window.location.href;
    const msg = t("enquireWaMessage", { name: veilName, url });
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <MagneticButton
      type="button"
      onClick={handleClick}
      className="bg-ink px-8 py-4 text-porcelain transition-colors duration-300 hover:bg-gold-deep"
      strength={0.3}
      labelStrength={0.25}
    >
      <span className="small-caps !text-current">{t("enquireCta")}</span>
      <span aria-hidden className="rtl:rotate-180">
        &rarr;
      </span>
    </MagneticButton>
  );
}
