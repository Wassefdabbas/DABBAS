"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import { easeOutExpo, revealDurations } from "@/lib/motion";

/**
 * Prefer the logical directions ("start"/"end") for horizontal wipes — they
 * resolve against the locale so the reveal mirrors correctly in RTL.
 * "left"/"right" remain for the rare physically-anchored case.
 */
type Direction = "start" | "end" | "left" | "right" | "top" | "bottom";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Side the clip-mask opens from. Default "bottom" (curtain rises). */
  direction?: Direction;
  /** Custom delay before entering (s). */
  delay?: number;
  once?: boolean;
  /**
   * When the reveal plays.
   * - "inView" (default) — on scroll into view. Right for below-the-fold media.
   * - "mount" — on load. Required for above-the-fold heroes: an element that's
   *   already in view on mount never gets an in-view trigger, so it would stay
   *   clipped shut. The hero settles in on load instead.
   */
  reveal?: "inView" | "mount";
};

const clipFor: Record<Exclude<Direction, "start" | "end">, { hidden: string; visible: string }> = {
  bottom: { hidden: "inset(100% 0 0 0)", visible: "inset(0 0 0 0)" },
  top:    { hidden: "inset(0 0 100% 0)", visible: "inset(0 0 0 0)" },
  left:   { hidden: "inset(0 100% 0 0)", visible: "inset(0 0 0 0)" },
  right:  { hidden: "inset(0 0 0 100%)", visible: "inset(0 0 0 0)" },
};

/**
 * <RevealImage>
 * Two-layer entrance:
 *   1. Outer clip-path wipe (the "curtain")
 *   2. Inner scale from 1.08 → 1.0 (the slow settle, like a lens easing in)
 *
 * Pass any media as children — <Image>, <video>, a styled div. The component
 * just provides the masked-window + zoom motion.
 */
export function RevealImage({
  children,
  className,
  direction = "bottom",
  delay = 0,
  once = true,
  reveal = "inView",
}: Props) {
  const reduced = useReducedMotion();
  const locale = useLocale();
  const isRtl = locale === "ar";

  // Resolve logical directions against the writing direction.
  const physical =
    direction === "start"
      ? isRtl
        ? "right"
        : "left"
      : direction === "end"
        ? isRtl
          ? "left"
          : "right"
        : direction;
  const clip = clipFor[physical];

  if (reduced) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {children}
      </div>
    );
  }

  const onMount = reveal === "mount";

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: clip.hidden }}
      animate={onMount ? { clipPath: clip.visible } : undefined}
      whileInView={onMount ? undefined : { clipPath: clip.visible }}
      viewport={onMount ? undefined : { once, margin: "-12%" }}
      transition={{
        duration: revealDurations.image,
        ease: easeOutExpo,
        delay,
      }}
    >
      <motion.div
        className="h-full w-full will-change-transform"
        initial={{ scale: 1.08 }}
        animate={onMount ? { scale: 1 } : undefined}
        whileInView={onMount ? undefined : { scale: 1 }}
        viewport={onMount ? undefined : { once, margin: "-12%" }}
        transition={{
          duration: revealDurations.image + 0.3,
          ease: easeOutExpo,
          delay,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
