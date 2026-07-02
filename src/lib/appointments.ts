/**
 * Appointment requests — the site's single conversion goal, captured.
 *
 * Same shape of data layer as collection.ts / categories.ts: reads from the
 * `appointments` Mongo collection when configured, and every write requires
 * the DB (there's no sensible hardcoded fallback for a booking). The slug/id
 * is a generated UUID used as the Mongo `_id`.
 *
 * A request is created by the PUBLIC contact form (unauthenticated) and read
 * / triaged in the admin inbox.
 */

import type { Db } from "mongodb";
import { randomUUID } from "node:crypto";
import { getDb } from "./mongo";
import type {
  Appointment,
  AppointmentStatus,
  NewAppointment,
} from "./appointment-shared";

// Re-export the client-safe types/constants so server callers can keep
// importing everything appointment-related from this one module.
export {
  CONTACT_METHODS,
  type Appointment,
  type AppointmentStatus,
  type ContactMethod,
  type NewAppointment,
} from "./appointment-shared";

const COLLECTION_NAME = "appointments";
type AppointmentDoc = Appointment & { _id: string };

function apptCol(db: Db) {
  return db.collection<AppointmentDoc>(COLLECTION_NAME);
}

/* ----------------------------------------------------------------- reads -- */

/**
 * All requests, newest first. Returns [] when Mongo is unconfigured/unreachable
 * (an empty inbox reads the same as a broken one to the admin, and the admin
 * page separately shows the Mongo status banner).
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const docs = await apptCol(db)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      void _id;
      return rest as Appointment;
    });
  } catch (e) {
    console.error("Appointments read failed:", e);
    return [];
  }
}

/** Count of untriaged requests — for the sidebar badge. */
export async function getNewAppointmentCount(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;
    return await apptCol(db).countDocuments({ status: "new" });
  } catch (e) {
    console.error("Appointments count failed:", e);
    return 0;
  }
}

/* ---------------------------------------------------------------- writes -- */

/** Throws if Mongo isn't configured — a booking has to be stored somewhere. */
async function requireDb() {
  const db = await getDb();
  if (!db)
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in .env.local before writing.",
    );
  return db;
}

/**
 * Persist a new request. Returns the created record (with its id). Called by
 * the public submit action, so it never trusts client-supplied id/status.
 */
export async function createAppointment(
  input: NewAppointment,
): Promise<Appointment> {
  const db = await requireDb();
  const appointment: Appointment = {
    ...input,
    id: randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  await apptCol(db).insertOne({ _id: appointment.id, ...appointment });
  return appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<void> {
  const db = await requireDb();
  await apptCol(db).updateOne({ _id: id }, { $set: { status } });
}

export async function deleteAppointment(id: string): Promise<void> {
  const db = await requireDb();
  await apptCol(db).deleteOne({ _id: id });
}
