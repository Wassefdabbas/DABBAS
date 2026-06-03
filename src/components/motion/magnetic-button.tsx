"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

// Motion overloads these event handlers with its own signatures; omit so we
// can pass plain HTML button attrs through to either <motion.button> or
// <button> without type conflicts.
type MotionConflicts =
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd";

type Props = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | MotionConflicts
> & {
  children: ReactNode;
  /**
   * 0..1. How much the button shifts toward the cursor.
   * 0.35 is a confident-but-quiet feel. Above 0.5 starts to feel toy-like.
   */
  strength?: number;
  /** Label moves an extra factor toward the cursor (creates the "tug"). */
  labelStrength?: number;
};

/**
 * <MagneticButton>
 * Desktop, fine-pointer only. On coarse pointers (touch) or reduced-motion,
 * the button is a plain <button> with no magnetism.
 *
 * Two layers move:
 *   - the button itself (strength)
 *   - the label inside, by an extra factor (labelStrength) — creates the
 *     subtle "fabric tug" toward the cursor.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  labelStrength = 0.35,
  ...buttonProps
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring on the position MV so any cursor jump is smoothed into a settle.
  const springConfig = { stiffness: 320, damping: 22, mass: 0.6 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  // Label moves by (strength + labelStrength) total relative to base.
  const labelMultiplier = 1 + labelStrength;
  const lx = useTransform(sx, (v) => v * labelMultiplier);
  const ly = useTransform(sy, (v) => v * labelMultiplier);

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left - rect.width / 2;
    const py = e.clientY - rect.top - rect.height / 2;
    x.set(px * strength);
    y.set(py * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (reduced) {
    return (
      <button ref={ref} className={cn(className)} {...buttonProps}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("will-change-transform", className)}
      {...buttonProps}
    >
      <motion.span
        style={{ x: lx, y: ly }}
        className="inline-flex items-center gap-4 will-change-transform"
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
