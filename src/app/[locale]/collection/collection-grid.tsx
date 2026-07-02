"use client";

import { useMemo, useState } from "react";
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

  const visible = useMemo(
    () => (active ? filterByCategory(items, active) : items),
    [items, active],
  );

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
              onClick={() => setActive(null)}
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
                  onClick={() => setActive(null)}
                />
                {used.map((c) => (
                  <Chip
                    key={c.slug}
                    label={c.name}
                    active={active === c.slug}
                    onClick={() => setActive(c.slug)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <p className="mx-auto max-w-md py-20 text-center text-graphite">
          {emptyText ?? t("empty")}
        </p>
      ) : (
        <motion.div
          layout={!reduced}
          className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16"
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
                  className="group block focus:outline-none"
                >
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
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 45vw"
                        className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      />
                    </div>
                    {/* Second image — fades in on hover */}
                    {veil.hover && (
                      <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-100">
                        <BrandImage
                          image={veil.hover}
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 45vw"
                          className="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/30" />
                    {/* Caption lifts in on hover */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/70 to-transparent px-5 py-5 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="small-caps !text-porcelain/85">
                        {veil.lineLabel}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h2 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
                      {veil.name}
                    </h2>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
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
