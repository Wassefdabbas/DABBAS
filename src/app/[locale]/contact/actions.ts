"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import {
  createAppointment,
  CONTACT_METHODS,
  type ContactMethod,
} from "@/lib/appointments";

/**
 * State returned to the public appointment form via useActionState.
 * `ok` drives the confirmation swap; `unreachable` distinguishes a storage
 * failure (Mongo down) so the form can nudge toward WhatsApp/email instead
 * of implying the bride did something wrong.
 */
export type AppointmentFormState = {
  ok?: boolean;
  error?: string;
  unreachable?: boolean;
};

const LIMITS = { name: 120, contactValue: 200, message: 2000 } as const;

function isContactMethod(v: string): v is ContactMethod {
  return (CONTACT_METHODS as string[]).includes(v);
}

/**
 * Public — NOT admin-gated. Anyone can request an appointment. Guards are
 * validation + length caps only; never trusts client id/status (createAppointment
 * assigns those). Writes to Mongo; on storage failure returns `unreachable`
 * so the UI points at the direct channels.
 */
export async function submitAppointmentAction(
  _prev: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  // Resolve the locale for error copy from the hidden field; fall back to EN.
  const rawLocale = String(formData.get("locale") ?? "en");
  const locale: Locale = routing.locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : "en";
  const t = await getTranslations({ locale, namespace: "Contact.form.errors" });

  const name = String(formData.get("name") ?? "").trim();
  const rawMethod = String(formData.get("contactMethod") ?? "whatsapp");
  const contactValue = String(formData.get("contactValue") ?? "").trim();
  const preferredDateRaw = String(formData.get("preferredDate") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { ok: false, error: t("nameRequired") };
  if (name.length > LIMITS.name) return { ok: false, error: t("tooLong") };
  if (!contactValue) return { ok: false, error: t("contactRequired") };
  if (contactValue.length > LIMITS.contactValue)
    return { ok: false, error: t("tooLong") };
  if (message.length > LIMITS.message) return { ok: false, error: t("tooLong") };

  const contactMethod = isContactMethod(rawMethod) ? rawMethod : "whatsapp";
  // Accept only a clean ISO date; anything else is dropped rather than trusted.
  const preferredDate = /^\d{4}-\d{2}-\d{2}$/.test(preferredDateRaw)
    ? preferredDateRaw
    : "";

  try {
    await createAppointment({
      name,
      contactMethod,
      contactValue,
      preferredDate,
      message,
      locale,
    });
  } catch (e) {
    console.error("Appointment submit failed:", e);
    return { ok: false, error: t("unreachable"), unreachable: true };
  }

  revalidatePath("/admin/appointments", "page");
  return { ok: true };
}
