"use client";

import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/motion";
import { whatsappUrl } from "@/lib/contact";

/**
 * Flow 2 — veil detail page CTA.
 * Opens WhatsApp directly with the veil name + current page URL pre-filled.
 * No form, no dashboard write — pure client redirect.
 */
export function VeilEnquireButton({ veilName }: { veilName: string }) {
  const t = useTranslations("Collection.detail");

  const handleClick = () => {
    const msg = t("enquireWaMessage", { name: veilName, url: window.location.href });
    window.open(whatsappUrl(msg), "_blank", "noopener,noreferrer");
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
