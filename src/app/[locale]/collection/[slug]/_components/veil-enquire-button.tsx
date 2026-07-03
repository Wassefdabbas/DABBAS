"use client";

import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/motion";
import { whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/cn";

/**
 * Flow 2 — veil detail page CTA.
 * Opens WhatsApp directly with the veil name + current page URL pre-filled.
 * No form, no dashboard write — pure client redirect.
 *
 * `variant` lets it sit beside the primary "Book an Appointment" CTA:
 * "primary" is the filled ink button; "secondary" is a quiet outline so the
 * booking CTA stays the loudest thing on the page.
 */
export function VeilEnquireButton({
  veilName,
  variant = "primary",
}: {
  veilName: string;
  variant?: "primary" | "secondary";
}) {
  const t = useTranslations("Collection.detail");

  const handleClick = () => {
    const msg = t("enquireWaMessage", { name: veilName, url: window.location.href });
    window.open(whatsappUrl(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <MagneticButton
      type="button"
      onClick={handleClick}
      className={cn(
        "px-8 py-4 transition-colors duration-300",
        variant === "primary"
          ? "bg-ink text-porcelain hover:bg-gold-deep"
          : "border border-ink/25 text-ink hover:border-gold hover:text-gold-deep",
      )}
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
