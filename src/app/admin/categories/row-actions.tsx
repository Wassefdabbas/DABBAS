"use client";

import { useTransition } from "react";
import { deleteCategoryAction } from "./actions";

export function CategoryRowActions({ slug, name }: { slug: string; name: string }) {
  const [pending, start] = useTransition();
  const onClick = () => {
    if (!window.confirm(`Delete category "${name}"? Veils with this category will lose the reference.`))
      return;
    start(async () => {
      await deleteCategoryAction(slug);
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
