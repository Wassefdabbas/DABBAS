"use client";

import { useState, useTransition } from "react";
import { createCategoryAction } from "./actions";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CategoryNewForm() {
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const effectiveSlug = autoSlug ? slugify(nameEn) : slug;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nameEn.trim()) return setError("Name (EN) is required.");
    if (!effectiveSlug) return setError("Slug is required.");
    start(async () => {
      try {
        await createCategoryAction({
          slug: effectiveSlug,
          name: { en: nameEn, ar: nameAr },
        });
        setNameEn("");
        setNameAr("");
        setSlug("");
        setAutoSlug(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="small-caps mb-1 block !text-muted">Name — EN</span>
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
            className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="small-caps mb-1 block !text-muted">Name — AR</span>
          <input
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            dir="rtl"
            className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <div>
        <label className="block">
          <span className="small-caps mb-1 block !text-muted">Slug</span>
          <input
            value={effectiveSlug}
            onChange={(e) => {
              setAutoSlug(false);
              setSlug(e.target.value);
            }}
            placeholder="auto-generated from name"
            className="w-full border border-ink/15 bg-porcelain px-3 py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>
        {autoSlug && (
          <p className="mt-1 text-xs text-muted">
            Auto-generated from the EN name. Edit to override.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-gold-deep">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="small-caps inline-flex items-center gap-3 bg-ink px-5 py-2 !text-porcelain transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {pending ? "Saving…" : "+ Add category"}
        </button>
      </div>
    </form>
  );
}
