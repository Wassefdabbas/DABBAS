"use client";

import { useTransition } from "react";
import { deleteVeilAction } from "../veils/actions";

export function DeleteButton({ slug, name }: { slug: string; name: string }) {
  const [pending, start] = useTransition();
  const onClick = () => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(async () => {
      await deleteVeilAction(slug);
    });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="small-caps !text-gold-deep transition-colors hover:!text-ink disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
