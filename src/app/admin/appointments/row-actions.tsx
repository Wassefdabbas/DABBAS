"use client";

import { useTransition } from "react";
import { cn } from "@/lib/cn";
import type { AppointmentStatus } from "@/lib/appointment-shared";
import {
  setAppointmentStatusAction,
  deleteAppointmentAction,
} from "./actions";

const FLOW: Record<AppointmentStatus, { next: AppointmentStatus; label: string } | null> = {
  new: { next: "contacted", label: "Mark contacted" },
  contacted: { next: "archived", label: "Archive" },
  archived: { next: "new", label: "Reopen" },
};

/**
 * Per-row triage: advance the status through new → contacted → archived
 * (→ back to new), plus a destructive delete. Mirrors the categories
 * row-actions pattern (useTransition + window.confirm on delete).
 */
export function AppointmentRowActions({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: AppointmentStatus;
}) {
  const [pending, start] = useTransition();
  const step = FLOW[status];

  const advance = () => {
    if (!step) return;
    start(async () => {
      await setAppointmentStatusAction(id, step.next);
    });
  };

  const remove = () => {
    if (!window.confirm(`Delete the request from "${name}"? This can't be undone.`))
      return;
    start(async () => {
      await deleteAppointmentAction(id);
    });
  };

  return (
    <div className="flex shrink-0 items-center gap-4">
      {step && (
        <button
          type="button"
          onClick={advance}
          disabled={pending}
          className={cn(
            "rounded-md border border-ink/15 px-4 py-2 text-sm text-ink transition-colors",
            "hover:border-gold hover:text-gold-deep disabled:opacity-50",
          )}
        >
          {pending ? "Saving…" : step.label}
        </button>
      )}
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="small-caps !text-gold-deep transition-colors hover:!text-ink disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
