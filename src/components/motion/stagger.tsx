"use client";

import { motion, type Variants } from "motion/react";
import { Children } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import {
  easeOutExpo,
  revealDurations,
  stagger as staggerCfg,
} from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Delay before first child (s). */
  delay?: number;
  /** Per-child delay (s). */
  staggerChildren?: number;
  /** Y travel distance (px). */
  distance?: number;
  /** Once-only on enter view. Default true. */
  once?: boolean;
};

/**
 * <Stagger>
 * Wraps each direct child in a motion.div and reveals them with a soft
 * translate-up + fade-in stagger when the group enters the viewport.
 *
 * Each wrapper takes the full block of its child, so you can use grids/flex
 * on the <Stagger> itself.
 */
export function Stagger({
  children,
  className,
  delay = 0,
  staggerChildren = staggerCfg.items,
  distance = 24,
  once = true,
}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren: delay } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: revealDurations.fade, ease: easeOutExpo },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10%" }}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={item} className="will-change-transform">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
