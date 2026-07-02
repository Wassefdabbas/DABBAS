import { requireAdmin } from "@/lib/admin/guard";
import { isMongoConfigured } from "@/lib/mongo";
import {
  getAppointments,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/appointments";
import { whatsappUrl } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { AdminShell } from "../_components/admin-shell";
import { AppointmentRowActions } from "./row-actions";

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  new: "border-gold bg-gold/10 text-gold-deep",
  contacted: "border-ink/20 text-graphite",
  archived: "border-mist text-muted",
};

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
}

/** A clickable link to reach the requester through their chosen channel. */
function contactHref(a: Appointment): string {
  if (a.contactMethod === "email") return `mailto:${a.contactValue}`;
  if (a.contactMethod === "phone") return `tel:${a.contactValue}`;
  return whatsappUrl(undefined, a.contactValue.replace(/[^\d]/g, ""));
}

export default async function AppointmentsPage() {
  await requireAdmin();
  const appointments = await getAppointments();
  const mongo = isMongoConfigured();
  const newCount = appointments.filter((a) => a.status === "new").length;

  return (
    <AdminShell eyebrow="Enquiries" title="Appointments">
      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-mist bg-pearl p-5">
        <div className="text-sm text-graphite">
          <p>
            MongoDB:{" "}
            <span className={mongo ? "text-ink" : "text-gold-deep"}>
              {mongo ? "connected" : "not configured"}
            </span>
          </p>
          <p className="mt-1">
            <span className="text-ink">{appointments.length}</span> request
            {appointments.length === 1 ? "" : "s"}
            {newCount > 0 && (
              <span className="text-gold-deep"> · {newCount} new</span>
            )}
            .
          </p>
        </div>
      </div>

      {!mongo && (
        <p className="mt-6 rounded-lg border border-mist bg-pearl p-4 text-sm text-graphite">
          Set <code className="text-ink">MONGODB_URI</code> in{" "}
          <code className="text-ink">.env.local</code> to receive and store
          appointment requests.
        </p>
      )}

      {appointments.length === 0 ? (
        <p className="mt-8 text-sm text-graphite">
          No requests yet. Submissions from the contact form will appear here,
          newest first.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {appointments.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-4 rounded-lg border border-mist bg-porcelain p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-[family-name:var(--font-display)] text-xl text-ink">
                    {a.name}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-0.5 text-[0.6875rem] uppercase tracking-[0.14em]",
                      STATUS_STYLE[a.status],
                    )}
                  >
                    {a.status}
                  </span>
                  <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
                    {a.locale}
                  </span>
                </div>

                <p className="mt-2 text-sm text-graphite">
                  <span className="text-muted">{a.contactMethod}:</span>{" "}
                  <a
                    href={contactHref(a)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline-offset-2 hover:underline"
                  >
                    {a.contactValue}
                  </a>
                </p>

                {a.preferredDate && (
                  <p className="mt-1 text-sm text-graphite">
                    <span className="text-muted">Preferred:</span>{" "}
                    {fmtDate(a.preferredDate)}
                  </p>
                )}

                {a.message && (
                  <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm text-graphite">
                    {a.message}
                  </p>
                )}

                <p className="mt-3 text-xs text-muted">
                  {fmtDateTime(a.createdAt)}
                </p>
              </div>

              <AppointmentRowActions id={a.id} name={a.name} status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
