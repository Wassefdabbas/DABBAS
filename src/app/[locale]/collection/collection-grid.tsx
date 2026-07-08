"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BrandImage } from "@/components/brand-image";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { easeOutExpo } from "@/lib/motion";
import { filterByCategory } from "@/lib/category-filter";
import { cn } from "@/lib/cn";
import type { BrandImage as BrandImageData } from "@/lib/images";

export type GridItem = {
  slug: string;
  name: string;
  lineLabel: string;
  cover: BrandImageData;
  /** Next image revealed on hover — the veil's second image; null = no swap. */
  hover: BrandImageData | null;
  categorySlug: string | null;
};

export type FilterCategory = { slug: string; name: string };

/** Veils per page — 5 full rows of the 3-column grid. */
const PAGE_SIZE = 15;

/**
 * Collection grid with a luxury, click-to-open filter.
 *
 * The filter sits as a single quiet "Filter" control; clicking it slides open a
 * panel of category chips. Choosing one filters the grid; the cards re-flow
 * with a soft layout animation. Fully keyboard accessible, RTL-safe, and
 * reduced-motion aware.
 */
export function CollectionGrid({
  items,
  categories,
  emptyText,
}: {
  items: GridItem[];
  categories: FilterCategory[];
  /** Override the generic empty message (e.g. bespoke's made-to-order note). */
  emptyText?: string;
}) {
  const t = useTranslations("Collection.index");
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null); // null = all
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (active ? filterByCategory(items, active) : items),
    [items, active],
  );

  // Changing the filter always lands back on page 1.
  const selectCategory = (slug: string | null) => {
    setActive(slug);
    setPage(1);
  };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = useMemo(
    () => filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [filtered, current],
  );

  const goToPage = (next: number) => {
    setPage(next);
    // Bring the top of the grid back into view; small offset clears the nav.
    const el = gridTopRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const activeName =
    active === null
      ? t("all")
      : (categories.find((c) => c.slug === active)?.name ?? t("all"));

  // Only offer categories that actually have veils.
  const used = useMemo(() => {
    const set = new Set(items.map((v) => v.categorySlug).filter(Boolean));
    return categories.filter((c) => set.has(c.slug));
  }, [items, categories]);

  const hasFilter = used.length > 0;

  return (
    <>
      {/* ── Filter bar ─────────────────────────────────────── */}
      {hasFilter && (
        <div className="mb-12 flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.16em] text-ink"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
                open ? "border-gold text-gold-deep" : "border-ink/25 text-ink",
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="h-4 w-4">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
            </span>
            {t("filter")}
            <span className="text-muted">· {activeName}</span>
          </button>

          {active !== null && (
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className="text-xs uppercase tracking-[0.16em] text-muted underline-offset-4 transition-colors hover:text-ink"
            >
              {t("all")}
            </button>
          )}
        </div>
      )}

      {/* ── Filter panel (reveals on click) ──────────────────
          Animates grid-template-rows 0fr → 1fr, the CSS technique for
          opening to auto height without animating `height` itself (per
          CLAUDE.md: never animate layout properties with JS). The panel
          stays mounted; `inert` keeps its chips out of the tab order and
          away from assistive tech while closed. Reduced motion is handled
          by the global CSS kill-switch. */}
      {hasFilter && (
        <div
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mb-12 border-y border-mist py-6">
              <p className="small-caps mb-4">{t("filterBy")}</p>
              <div className="flex flex-wrap gap-3">
                <Chip
                  label={t("all")}
                  active={active === null}
                  onClick={() => selectCategory(null)}
                />
                {used.map((c) => (
                  <Chip
                    key={c.slug}
                    label={c.name}
                    active={active === c.slug}
                    onClick={() => selectCategory(c.slug)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────── */}
      {/* Scroll anchor — page changes bring this back into view */}
      <div ref={gridTopRef} aria-hidden />
      {visible.length === 0 ? (
        <p className="mx-auto max-w-md py-20 text-center text-graphite">
          {emptyText ?? t("empty")}
        </p>
      ) : (
        <motion.div
          layout={!reduced}
          className="grid grid-cols-2 gap-[2px] sm:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((veil) => (
              <motion.div
                key={veil.slug}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
              >
                <Link
                  href={`/collection/${veil.slug}`}
                  aria-label={veil.name}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {/* Image only — no zoom, no dark filter, no caption/name.
                      On hover it crossfades to the veil's second image. */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                    {/* Cover — fades out on hover when a second image exists */}
                    <div
                      className={
                        veil.hover
                          ? "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-0"
                          : "absolute inset-0"
                      }
                    >
                      <BrandImage
                        image={veil.cover}
                        sizes="(min-width: 640px) 33vw, 50vw"
                      />
                    </div>
                    {/* Second image — fades in on hover */}
                    {veil.hover && (
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-100">
                        <BrandImage
                          image={veil.hover}
                          sizes="(min-width: 640px) 33vw, 50vw"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Pagination ─────────────────────────────────────── */}
      {pageCount > 1 && (
        <nav
          aria-label={t("pagination")}
          className="mt-16 flex items-center justify-center gap-2"
        >
          <PageArrow
            direction="prev"
            label={t("pagePrev")}
            disabled={current === 1}
            onClick={() => goToPage(current - 1)}
          />
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-current={p === current ? "page" : undefined}
              aria-label={t("pageN", { page: p })}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm tabular-nums transition-colors duration-300",
                p === current
                  ? "border-gold bg-ink text-porcelain"
                  : "border-transparent text-graphite hover:border-ink/20 hover:text-ink",
              )}
            >
              {p}
            </button>
          ))}
          <PageArrow
            direction="next"
            label={t("pageNext")}
            disabled={current === pageCount}
            onClick={() => goToPage(current + 1)}
          />
        </nav>
      )}
    </>
  );
}

function PageArrow({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-gold hover:text-gold-deep disabled:pointer-events-none disabled:opacity-25"
    >
      {/* Logical prev/next — flips under RTL so "next" always points forward */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-4 w-4 rtl:rotate-180", direction === "prev" && "rotate-180 rtl:rotate-0")}
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-5 py-2 text-sm uppercase tracking-[0.14em] transition-colors duration-300",
        active
          ? "border-gold bg-ink text-porcelain"
          : "border-ink/20 text-graphite hover:border-ink hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
