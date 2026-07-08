/**
 * Client-safe collection primitives.
 *
 * Pure types, the `SPEC_KEYS` constant, and the `pickL` helper — nothing here
 * imports `@/lib/mongo` (or the `mongodb` driver), so `"use client"` files can
 * import these WITHOUT dragging Node built-ins (`tls`, `net`, `fs`) into the
 * browser bundle.
 *
 * `collection.ts` (the server-only data layer) re-exports everything below, so
 * existing server-side `@/lib/collection` imports keep working unchanged.
 *
 * Mirrors the pattern of `appointment-shared.ts` and `category-filter.ts`.
 * See CLAUDE.md: "never import a value from a module that transitively imports
 * `@/lib/mongo` into a `"use client"` file — extract the shared value."
 */

import type { BrandImage } from "./images";
import type { Locale } from "@/i18n/routing";

export type Localized = { en: string; ar: string };

export type VeilDetail = {
  title: Localized;
  body: Localized;
};

/**
 * Structured, single-line spec fields shown on the detail page as a quiet
 * definition list. All optional — only the ones the admin fills in render.
 * Ordered here the way they appear on the page.
 */
export type VeilSpecs = {
  material?: Localized;
  lace?: Localized;
  decoration?: Localized;
  silhouette?: Localized;
  color?: Localized;
  designer?: Localized;
};

/** The spec keys in display order — the single source of truth for both the
 *  admin form and the detail page. */
export const SPEC_KEYS = [
  "material",
  "lace",
  "decoration",
  "silhouette",
  "color",
  "designer",
] as const;
export type SpecKey = (typeof SPEC_KEYS)[number];

export type Veil = {
  slug: string;
  name: Localized;
  lineLabel: Localized;
  cover: BrandImage;
  gallery: BrandImage[];
  /** Short description shown on the detail page. */
  description: Localized;
  /** Structured single-line specs (material, lace, …) — optional. */
  specs?: VeilSpecs | null;
  details: VeilDetail[];
  /** Slugs of other veils that complete a bridal look. */
  completeYourLook: string[];
  /** Slugs of stylistically similar veils. */
  youMayAlsoLike: string[];
  /**
   * Optional price — bilingual so the atelier can write e.g.
   *   { en: "From $1,200", ar: "ابتداءً من ١٢٠٠ دولار" }
   * Set to null/omit to hide pricing on the detail page.
   */
  price?: Localized | null;
  /** Optional reference to a Category by slug. */
  categorySlug?: string | null;
  /**
   * Manual display position set from the admin "Reorder" arrows. Lower comes
   * first everywhere `getVeils()` is read (collection grid, featured fallback).
   * Veils without one sort after the ordered ones, in insertion order.
   */
  order?: number | null;
};

/** Read a localized string for the active locale, with EN fallback. */
export function pickL(value: Localized, locale: Locale): string {
  return value[locale] ?? value.en;
}
