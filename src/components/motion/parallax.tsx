"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  className?: string;
  /**
   * Parallax strength.
   * `0` = static. `1` = strong. Negative = inverted (moves opposite the scroll).
   * Default 0.3 — a slow drift, never an obvious lift.
   */
  speed?: number;
  /** Axis to translate along. Default "y". */
  axis?: "x" | "y";
};

/**
 * <Parallax>
 * Scroll-driven translate using Motion's useScroll/useTransform, tied to the
 * element's position in the viewport (start-end -> end-start).
 *
 * Use sparingly. The hero veil drift is the canonical use.
 */
export function Parallax({
  children,
  className,
  speed = 0.3,
  axis = "y",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Travel ±(80px * speed) across the element's full scroll lifetime.
  const distance = 80 * speed;
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const x = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        style={axis === "y" ? { y } : { x }}
        // h-full w-full so children using `fill` / `absolute inset-0`
        // (e.g. <BrandImage>, <BrandMedia>) get a real box to measure.
        className="h-full w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
