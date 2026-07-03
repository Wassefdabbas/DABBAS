"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageManager } from "./image-manager";
import {
  createVeilAction,
  updateVeilAction,
} from "../veils/actions";
import type { BrandImage as BrandImageData } from "@/lib/images";
import type { Veil, Localized, VeilDetail, SpecKey } from "@/lib/collection";
import { SPEC_KEYS } from "@/lib/collection";
import type { Category } from "@/lib/categories";
import { cn } from "@/lib/cn";

/** Admin-facing labels for the structured spec fields (UI is English). */
const SPEC_LABELS: Record<SpecKey, string> = {
  material: "Material",
  lace: "Lace",
  decoration: "Decoration",
  silhouette: "Silhouette",
  color: "Color",
  designer: "Designer",
};

const blankLocalized = (): Localized => ({ en: "", ar: "" });
const blankVeil = (): Veil => ({
  slug: "",
  name: blankLocalized(),
  lineLabel: blankLocalized(),
  cover: null as unknown as BrandImageData,
  gallery: [],
  description: blankLocalized(),
  details: [],
  completeYourLook: [],
  youMayAlsoLike: [],
  price: null,
  categorySlug: null,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function VeilForm({
  initial,
  originalSlug,
  otherSlugs,
  categories,
}: {
  initial?: Veil;
  /** If editing, the slug as stored in Mongo. */
  originalSlug?: string;
  /** Slugs of every other veil — for relation checkboxes (advanced panel). */
  otherSlugs: { slug: string; name: string }[];
  /** Categories the admin can assign. */
  categories: Category[];
}) {
  const router = useRouter();
  const [veil, setVeil] = useState<Veil>(initial ?? blankVeil());
  const [autoSlug, setAutoSlug] = useState(!originalSlug); // edit: keep manual
  const [usePrice, setUsePrice] = useState<boolean>(!!initial?.price);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  /* Field updaters */
  const set = <K extends keyof Veil>(k: K, v: Veil[K]) =>
    setVeil((p) => ({ ...p, [k]: v }));
  const setL = (k: "name" | "lineLabel" | "description", lang: "en" | "ar", v: string) =>
    setVeil((p) => {
      const next = { ...p, [k]: { ...p[k], [lang]: v } };
      // When EN name changes and slug is auto, update slug
      if (k === "name" && lang === "en" && autoSlug && !originalSlug) {
        next.slug = slugify(v);
      }
      return next;
    });
  const setPrice = (lang: "en" | "ar", v: string) =>
    setVeil((p) => ({
      ...p,
      price: { en: p.price?.en ?? "", ar: p.price?.ar ?? "", [lang]: v },
    }));

  /* Structured specs (material, lace, …) — each an optional bilingual line. */
  const setSpec = (key: SpecKey, lang: "en" | "ar", v: string) =>
    setVeil((p) => ({
      ...p,
      specs: {
        ...p.specs,
        [key]: {
          en: p.specs?.[key]?.en ?? "",
          ar: p.specs?.[key]?.ar ?? "",
          [lang]: v,
        },
      },
    }));

  /* Details */
  const addDetail = () =>
    set("details", [
      ...veil.details,
      { title: blankLocalized(), body: blankLocalized() },
    ]);
  const updateDetail = (i: number, next: VeilDetail) =>
    set("details", veil.details.map((d, idx) => (idx === i ? next : d)));
  const removeDetail = (i: number) =>
    set("details", veil.details.filter((_, idx) => idx !== i));

  /* Images — one ordered list to the UI; index 0 is the cover, rest is gallery.
     The data model keeps cover + gallery separate, so we flatten/split here. */
  const images: BrandImageData[] = [
    ...(veil.cover ? [veil.cover] : []),
    ...veil.gallery,
  ];
  const setImages = (next: BrandImageData[]) =>
    setVeil((p) => ({
      ...p,
      cover: (next[0] ?? null) as unknown as BrandImageData,
      gallery: next.slice(1),
    }));

  /* Relations */
  const toggleRelation = (
    field: "completeYourLook" | "youMayAlsoLike",
    slug: string,
  ) => {
    const current = veil[field];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    set(field, next);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!veil.name.en.trim()) return setError("Name (EN) is required.");
    if (!veil.slug.trim()) return setError("Slug is required.");
    if (!/^[a-z0-9-]+$/.test(veil.slug))
      return setError("Slug must be lowercase letters, digits, and hyphens.");
    if (!veil.cover) return setError("Add at least one image (the first becomes the cover).");

    const payload: Veil = {
      ...veil,
      // Backfill required-by-type fields if the admin left them empty
      name: { en: veil.name.en, ar: veil.name.ar || veil.name.en },
      lineLabel: {
        en: veil.lineLabel.en || "",
        ar: veil.lineLabel.ar || veil.lineLabel.en || "",
      },
      description: {
        en: veil.description.en || "",
        ar: veil.description.ar || veil.description.en || "",
      },
      price: usePrice && (veil.price?.en || veil.price?.ar) ? veil.price : null,
      categorySlug: veil.categorySlug || null,
    };

    start(async () => {
      try {
        if (originalSlug) {
          await updateVeilAction(originalSlug, payload);
        } else {
          await createVeilAction(payload);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-28">
      {/* ── Basics ─────────────────────────────────────────── */}
      <Panel title="Basics" description="The veil's name, web address, and category.">
        <BilingualField
          label="Name"
          value={veil.name}
          onChange={(lang, v) => setL("name", lang, v)}
          required
        />

        <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
          <TextField
            label="Slug (URL)"
            value={veil.slug}
            onChange={(v) => {
              setAutoSlug(false);
              set("slug", v);
            }}
            disabled={!!originalSlug}
            hint={
              originalSlug
                ? "Locked when editing — prevents broken inbound links."
                : autoSlug
                  ? "Auto-generated from the EN name."
                  : undefined
            }
          />
          {!originalSlug && !autoSlug && (
            <button
              type="button"
              onClick={() => {
                setAutoSlug(true);
                set("slug", slugify(veil.name.en));
              }}
              className="rounded-md border border-ink/15 px-4 py-2.5 text-sm text-graphite transition-colors hover:border-ink/30 hover:text-ink"
            >
              Reset to auto
            </button>
          )}
        </div>

        <Field label="Category">
          <select
            value={veil.categorySlug ?? ""}
            onChange={(e) => set("categorySlug", e.target.value || null)}
            className={inputClass}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name.en}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="mt-1.5 text-xs text-muted">
              No categories yet. Add some in the Categories section.
            </p>
          )}
        </Field>

        <BilingualField
          label="Line label"
          value={veil.lineLabel}
          onChange={(lang, v) => setL("lineLabel", lang, v)}
          hint="A short descriptor, e.g. “Cathedral length”."
        />
      </Panel>

      {/* ── Images ─────────────────────────────────────────── */}
      <Panel
        title="Images"
        description="Add as many as you like and drag the order. The first image (Cover) is shown everywhere — no separate cover upload. The rest form the detail-page gallery."
      >
        <ImageManager images={images} onChange={setImages} />
      </Panel>

      {/* ── Specifications ─────────────────────────────────── */}
      <Panel
        title="Specifications"
        description="Optional single-line details shown on the veil's page as a list. Only the rows you fill in appear."
      >
        {SPEC_KEYS.map((key) => (
          <BilingualField
            key={key}
            label={SPEC_LABELS[key]}
            value={veil.specs?.[key] ?? blankLocalized()}
            onChange={(lang, v) => setSpec(key, lang, v)}
          />
        ))}
      </Panel>

      {/* ── Story & price ──────────────────────────────────── */}
      <Panel title="Story & price" description="Optional copy and pricing shown on the detail page.">
        <BilingualField
          label="Short description"
          textarea
          value={veil.description}
          onChange={(lang, v) => setL("description", lang, v)}
        />

        <Field label="Price">
          <label className="flex items-center gap-3 text-sm text-graphite">
            <input
              type="checkbox"
              checked={usePrice}
              onChange={(e) => setUsePrice(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Show a price on the detail page
          </label>
          {usePrice && (
            <div className="mt-4">
              <BilingualField
                label="Price (free-form text)"
                value={veil.price ?? blankLocalized()}
                onChange={(lang, v) => setPrice(lang, v)}
                hint="e.g. “From $1,200” or “On request”."
              />
            </div>
          )}
        </Field>
      </Panel>

      {/* ── Advanced (collapsed) ───────────────────────────── */}
      <Panel
        title="Advanced"
        description="Detail accordion items and related-veil links. Optional."
      >
        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="self-start rounded-md border border-ink/15 px-4 py-2 text-sm text-graphite transition-colors hover:border-ink/30 hover:text-ink"
        >
          {showAdvanced ? "Hide advanced options" : "Show advanced options"}
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-8">
            {/* Details */}
            <div>
              <p className="mb-3 text-sm font-medium text-ink">
                Details accordion items
              </p>
              <div className="flex flex-col gap-4">
                {veil.details.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-3 rounded-lg border border-mist bg-pearl p-4"
                  >
                    <BilingualField
                      label={`Item ${i + 1} — title`}
                      value={d.title}
                      onChange={(lang, v) =>
                        updateDetail(i, { ...d, title: { ...d.title, [lang]: v } })
                      }
                    />
                    <BilingualField
                      label="Body"
                      textarea
                      value={d.body}
                      onChange={(lang, v) =>
                        updateDetail(i, { ...d, body: { ...d.body, [lang]: v } })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeDetail(i)}
                      className="self-start text-sm text-gold-deep transition-colors hover:text-ink"
                    >
                      Remove this item
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDetail}
                  className="self-start rounded-md border border-ink/15 px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold-deep"
                >
                  + Add detail item
                </button>
              </div>
            </div>

            {/* Relations */}
            <div className="grid gap-8 md:grid-cols-2">
              <RelationField
                label="Complete your look"
                value={veil.completeYourLook}
                options={otherSlugs}
                onToggle={(s) => toggleRelation("completeYourLook", s)}
              />
              <RelationField
                label="You may also like"
                value={veil.youMayAlsoLike}
                options={otherSlugs}
                onToggle={(s) => toggleRelation("youMayAlsoLike", s)}
              />
            </div>
          </div>
        )}
      </Panel>

      {/* ── Submit (sticky) ────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-mist bg-porcelain/95 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          {error ? (
            <p role="alert" className="text-sm text-gold-deep">
              {error}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="text-sm text-graphite transition-colors hover:text-ink"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-2.5 text-sm !text-porcelain transition-colors hover:bg-gold-deep disabled:opacity-50"
          >
            {pending
              ? "Saving…"
              : originalSlug
                ? "Save changes"
                : "Create veil"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ── Layout helpers ───────────────────────────────────────────── */

/** Shared input styling — a normal bordered field. */
const inputClass =
  "w-full rounded-md border border-ink/15 bg-porcelain px-3 py-2.5 text-ink transition-colors placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40";

/** A titled card grouping related fields. */
function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-mist bg-porcelain p-5 sm:p-6">
      <div className="mb-5 border-b border-mist pb-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** A labelled field wrapper for arbitrary inputs. */
function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">
        {label}
        {required && <span className="ms-1 text-gold-deep">*</span>}
      </p>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      {children}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────── */

function TextField({
  label,
  value,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(inputClass, disabled && "cursor-not-allowed opacity-60")}
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function BilingualField({
  label,
  value,
  onChange,
  textarea,
  hint,
  required,
}: {
  label: string;
  value: Localized;
  onChange: (lang: "en" | "ar", v: string) => void;
  textarea?: boolean;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">
        {label}
        {required && <span className="ms-1 text-gold-deep">*</span>}
      </p>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {(["en", "ar"] as const).map((lang) => {
          const Tag = textarea ? "textarea" : "input";
          return (
            <label key={lang} className="block">
              <span className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-wider text-muted">
                {lang === "en" ? "English" : "العربية"}
              </span>
              <Tag
                value={value[lang]}
                onChange={(
                  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
                ) => onChange(lang, e.target.value)}
                dir={lang === "ar" ? "rtl" : "ltr"}
                rows={textarea ? 4 : undefined}
                className={cn(inputClass, textarea && "resize-y")}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function RelationField({
  label,
  value,
  options,
  onToggle,
}: {
  label: string;
  value: string[];
  options: { slug: string; name: string }[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.length === 0 && (
          <p className="text-sm text-muted">No other veils yet.</p>
        )}
        {options.map((opt) => {
          const checked = value.includes(opt.slug);
          return (
            <label
              key={opt.slug}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors",
                checked
                  ? "border-gold/60 bg-gold-soft/10"
                  : "border-mist hover:border-ink/20",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt.slug)}
                className="h-4 w-4 accent-ink"
              />
              <span className="text-sm">
                <span className="text-ink">{opt.name}</span>
                <span className="ms-2 text-xs text-muted">
                  <code>{opt.slug}</code>
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
