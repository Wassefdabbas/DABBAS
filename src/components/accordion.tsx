"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import { easeOutExpo } from "@/lib/motion";

type Item = {
  /** Stable key (also used as the heading id base). */
  key: string;
  title: string;
  body: string;
};

type Props = {
  items: Item[];
  /** Allow multiple panels open at once. Default false (single open). */
  multiple?: boolean;
  /** Initially-open keys. */
  defaultOpen?: string[];
  className?: string;
};

/**
 * Accordion — accessible disclosure with smooth height animation.
 *
 * - Each row is a real <button> with aria-expanded + aria-controls.
 * - The panel uses role="region" with aria-labelledby pointing to its
 *   header button (per WAI-ARIA accordion pattern).
 * - Reduced motion: panels open/close instantly, no height tween.
 */
export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className,
}: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));
  const reduced = useReducedMotion();
  const baseId = useId();

  const toggle = (key: string) => {
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={cn("divide-y divide-mist border-y border-mist", className)}>
      {items.map((item) => {
        const isOpen = open.has(item.key);
        const headerId = `${baseId}-${item.key}-header`;
        const panelId = `${baseId}-${item.key}-panel`;

        return (
          <div key={item.key}>
            <h3>
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.key)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 py-5 text-start",
                  "small-caps !text-ink transition-colors duration-300 hover:!text-gold-deep",
                )}
              >
                <span>{item.title}</span>
                <motion.span
                  aria-hidden
                  animate={
                    reduced ? undefined : { rotate: isOpen ? 45 : 0 }
                  }
                  transition={
                    reduced
                      ? undefined
                      : { duration: 0.4, ease: easeOutExpo }
                  }
                  className="text-xl leading-none text-gold-deep"
                >
                  +
                </motion.span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={
                    reduced
                      ? undefined
                      : { height: "auto", opacity: 1 }
                  }
                  exit={
                    reduced
                      ? undefined
                      : { height: 0, opacity: 0 }
                  }
                  transition={
                    reduced
                      ? undefined
                      : { duration: 0.5, ease: easeOutExpo }
                  }
                  className="overflow-hidden"
                >
                  <p className="pb-6 text-graphite">{item.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
