"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "./wordmark";
import { LocaleSwitcher } from "./locale-switcher";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { easeOutExpo, revealDurations, stagger } from "@/lib/motion";

type NavKey = "atelier" | "collection" | "about" | "contact";

const items: Array<{
  key: NavKey;
  href: "/about" | "/collection" | "/contact";
}> = [
  { key: "atelier", href: "/about" },
  { key: "collection", href: "/collection" },
  { key: "contact", href: "/contact" },
];

/**
 * Full-screen overlay nav for small viewports.
 * - Wordmark + close at the top
 * - Large staggered display-serif links
 * - CTA + locale at the bottom
 *
 * Reduced-motion: opens/closes instantly, no stagger.
 */
export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Header");
  const reduced = useReducedMotion();

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const overlay: Variants = reduced
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.4, ease: easeOutExpo },
        },
      };

  const list: Variants = reduced
    ? { hidden: {}, visible: {} }
    : {
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger.lines, delayChildren: 0.1 },
        },
      };

  const line: Variants = reduced
    ? { hidden: {}, visible: {} }
    : {
        hidden: { y: "120%" },
        visible: {
          y: "0%",
          transition: { duration: revealDurations.text, ease: easeOutExpo },
        },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex flex-col bg-porcelain"
        >
          {/* Top bar mirrors the header height */}
          <div className="grid h-20 grid-cols-3 items-center px-6 sm:px-10">
            <span /> {/* spacer */}
            <div className="flex justify-center">
              <Wordmark className="text-base" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="-me-2.5 flex h-11 w-11 items-center justify-center text-graphite transition-colors hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Links */}
          <motion.nav
            variants={list}
            initial="hidden"
            animate="visible"
            aria-label="Mobile primary"
            className="flex flex-1 flex-col items-start justify-center gap-2 px-8"
          >
            {items.map((item) => (
              <span key={item.key} className="word-mask block">
                <motion.span variants={line} className="inline-block">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block font-[family-name:var(--font-display)] text-[clamp(2.5rem,11vw,5rem)] leading-[1.05] text-ink transition-colors hover:text-gold-deep"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </motion.span>
              </span>
            ))}
          </motion.nav>

          {/* Bottom: CTA + locale */}
          <div className="border-t border-mist px-6 py-6 text-ink sm:px-10">
            <div className="flex items-center justify-between gap-6">
              <Link
                href="/contact"
                onClick={onClose}
                className="small-caps flex items-center gap-3 bg-ink px-5 py-3 text-porcelain"
              >
                {t("cta")}
                <span aria-hidden className="rtl:rotate-180">
                  &rarr;
                </span>
              </Link>
              {/* Toggle hidden for now — logic/routing kept intact */}
              <LocaleSwitcher className="hidden" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A slim X — closes the overlay. Matches the header's hairline menu mark. */
function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden
      className="h-6 w-6"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
