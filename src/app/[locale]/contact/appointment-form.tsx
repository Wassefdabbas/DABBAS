"use client";

import { useActionState, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { CONTACT_METHODS, type ContactMethod } from "@/lib/appointment-shared";
import {
  submitAppointmentAction,
  type AppointmentFormState,
} from "./actions";

/**
 * The atelier's primary conversion path — a quiet request form. Writes to
 * MongoDB via the public `submitAppointmentAction`; on success the whole form
 * is replaced by an editorial confirmation (matching the newsletter's
 * success-state pattern). WhatsApp / email remain as a secondary path below.
 *
 * The contact-method segmented control is a real radio group (keyboard- and
 * screen-reader-native); the value input's type + placeholder follow the
 * chosen method.
 */
export function AppointmentForm({
  directHref,
}: {
  /** wa.me link, surfaced only if storage fails so the bride isn't stranded. */
  directHref: string;
}) {
  const t = useTranslations("Contact.form");
  const locale = useLocale();
  const [method, setMethod] = useState<ContactMethod>("whatsapp");
  const [state, formAction, pending] = useActionState<
    AppointmentFormState,
    FormData
  >(submitAppointmentAction, {});

  // Flow 1: open WhatsApp immediately after a successful dashboard save.
  // waText is the full appointment message built server-side (locale-aware).
  useEffect(() => {
    if (!state.ok || !state.waText) return;
    window.open(whatsappUrl(state.waText), "_blank", "noopener,noreferrer");
  }, [state.ok, state.waText]);

  if (state.ok) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 border-s-2 border-gold bg-pearl px-8 py-12 sm:px-12"
      >
        <p className="small-caps">{t("success.eyebrow")}</p>
        <p className="max-w-lg font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.15] text-ink">
          {t("success.headline")}
        </p>
        <p className="max-w-md text-graphite">{t("success.body")}</p>
      </div>
    );
  }

  const valueType =
    method === "email" ? "email" : method === "phone" ? "tel" : "text";

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="locale" value={locale} />

      {/* Name */}
      <label className="field-line block">
        <span className="small-caps mb-3 block !text-muted">
          {t("fields.name")}
        </span>
        <input
          type="text"
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          className="w-full border-b border-ink/20 bg-transparent py-3 text-ink placeholder:text-muted focus:outline-none"
          placeholder={t("placeholders.name")}
        />
      </label>

      {/* Contact method — segmented radio group */}
      <fieldset>
        <legend className="small-caps mb-3 block !text-muted">
          {t("fields.method")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_METHODS.map((m) => (
            <label key={m} className="cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value={m}
                checked={method === m}
                onChange={() => setMethod(m)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-flex items-center border px-5 py-2.5 text-sm uppercase tracking-[0.14em] transition-colors duration-300",
                  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold",
                  method === m
                    ? "border-gold bg-ink text-porcelain"
                    : "border-ink/20 text-graphite hover:border-ink hover:text-ink",
                )}
              >
                {t(`methods.${m}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Contact value — label + type follow the chosen method */}
      <label className="field-line block">
        <span className="small-caps mb-3 block !text-muted">
          {t(`valueLabel.${method}`)}
        </span>
        <input
          type={valueType}
          name="contactValue"
          required
          maxLength={200}
          inputMode={method === "email" ? "email" : "tel"}
          className="w-full border-b border-ink/20 bg-transparent py-3 text-ink placeholder:text-muted focus:outline-none"
          placeholder={t(`placeholders.${method}`)}
        />
      </label>

      {/* Preferred date — optional */}
      <label className="field-line block">
        <span className="small-caps mb-3 block !text-muted">
          {t("fields.date")}{" "}
          <span className="text-muted/70 normal-case tracking-normal">
            {t("optional")}
          </span>
        </span>
        <input
          type="date"
          name="preferredDate"
          className="w-full border-b border-ink/20 bg-transparent py-3 text-ink focus:outline-none"
        />
      </label>

      {/* Message — optional */}
      <label className="field-line block">
        <span className="small-caps mb-3 block !text-muted">
          {t("fields.message")}{" "}
          <span className="text-muted/70 normal-case tracking-normal">
            {t("optional")}
          </span>
        </span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          className="w-full resize-none border-b border-ink/20 bg-transparent py-3 text-ink placeholder:text-muted focus:outline-none"
          placeholder={t("placeholders.message")}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-gold-deep">
          {state.error}
          {state.unreachable && (
            <>
              {" "}
              <a
                href={directHref}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-gold pb-px !text-ink transition-colors hover:!text-gold-deep"
              >
                {t("errors.unreachableCta")}
              </a>
            </>
          )}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          data-submit-btn
          className="group inline-flex items-center gap-3 bg-espresso px-10 py-5 transition-colors duration-300 ease-[var(--ease-out-expo)] hover:bg-gold-deep disabled:opacity-50"
        >
          <span className="small-caps !text-porcelain">
            {pending ? t("submitting") : t("submit")}
          </span>
          <span
            aria-hidden
            className="text-porcelain transition-transform duration-[600ms] ease-[var(--ease-out-expo)] group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          >
            &rarr;
          </span>
        </button>
      </div>
    </form>
  );
}
