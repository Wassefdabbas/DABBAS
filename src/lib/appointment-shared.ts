/**
 * Appointment types + constants with NO server imports — safe to pull into
 * client components (the public form, admin row actions). The Mongo-backed
 * CRUD lives in appointments.ts, which re-exports everything here so server
 * code can keep importing from one place.
 */

import type { Locale } from "@/i18n/routing";

/** How the bride would like the atelier to reach her back. */
export type ContactMethod = "whatsapp" | "phone" | "email";

/** Triage state, set in the admin inbox. */
export type AppointmentStatus = "new" | "contacted" | "archived";

export type Appointment = {
  id: string;
  name: string;
  contactMethod: ContactMethod;
  /** The actual handle to reach them — phone number or email address. */
  contactValue: string;
  /** Preferred visit date as an ISO `YYYY-MM-DD` string, or "" if none given. */
  preferredDate: string;
  /** Free-text note. May be "". */
  message: string;
  /** Which language the form was submitted in — helps the atelier reply in kind. */
  locale: Locale;
  status: AppointmentStatus;
  /** ISO timestamp of submission. */
  createdAt: string;
};

/** The public form supplies everything except the server-assigned fields. */
export type NewAppointment = Omit<Appointment, "id" | "status" | "createdAt">;

export const CONTACT_METHODS: ContactMethod[] = ["whatsapp", "phone", "email"];
