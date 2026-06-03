import type { Transition } from "motion/react";

/**
 * DABBAS motion vocabulary.
 *
 * Veils settle. They never snap or bounce. Read CLAUDE.md before changing
 * these constants — the brand feel depends on them.
 */

/** Default spring: a confident settle. Use for buttons, hover, magnetic CTAs. */
export const springSettle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
  mass: 1,
};

/** Heavy/large elements (hero veil, image clips): slower, softer. */
export const springDrape: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 26,
  mass: 1.2,
};

/** Magnetic cursor follow. Very loose, near-instant. */
export const springMagnet: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 22,
  mass: 0.6,
};

/** Easing curves (non-spring, for opacity/scroll-driven transforms). */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;
export const easeOutQuart = [0.25, 1, 0.5, 1] as const;
export const easeInQuart = [0.5, 0, 0.75, 0] as const;

/** Reveal timings (eased, not sprung). */
export const revealDurations = {
  text: 0.9,
  image: 1.1,
  fade: 0.7,
} as const;

/** Stagger child delays. */
export const stagger = {
  words: 0.06,
  lines: 0.09,
  items: 0.08,
} as const;

/** Static fallback variants for reduced-motion users. */
export const instant: Transition = { duration: 0 };
