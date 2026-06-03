"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  /**
   * Render-prop. Receives a 0..1 MotionValue tracking scroll progress through
   * the pinned scene. Pass it to `useTransform` in your child to drive opacity,
   * y, scale, etc.
   */
  children: (progress: MotionValue<number>) => React.ReactNode;
  className?: string;
  /**
   * Total scroll length of the pinned section.
   * "200vh" = user scrolls through one full screen while the scene is pinned.
   */
  length?: string;
  /** Scrub smoothing in seconds (0 = direct). Default 0.6 to feel fabric-y. */
  scrub?: number | boolean;
};

/**
 * <ScrollScene>
 * GSAP ScrollTrigger pin + scrub wrapper, integrated with our Lenis ticker
 * via SmoothScrollProvider. Exposes scroll progress as a Motion MotionValue
 * via render-prop so children can use Motion's useTransform.
 *
 * Reduced-motion: no pin, no scrub, no GSAP — children render in their final
 * (progress = 1) state stacked normally.
 */
export function ScrollScene({
  children,
  className,
  length = "200vh",
  scrub = 0.6,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const progress = useMotionValue(0);

  useEffect(() => {
    if (reduced) {
      // Skip GSAP entirely; render children at "done" state.
      progress.set(1);
      return;
    }
    const container = containerRef.current;
    const pin = pinRef.current;
    if (!container || !pin) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        pin,
        start: "top top",
        end: "bottom bottom",
        scrub,
        onUpdate: (self) => progress.set(self.progress),
      });
    }, container);

    return () => ctx.revert();
  }, [reduced, scrub, progress]);

  if (reduced) {
    return (
      <div className={cn("relative", className)}>{children(progress)}</div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{ height: length }}
    >
      <div ref={pinRef} className="h-screen w-full overflow-hidden">
        {children(progress)}
      </div>
    </div>
  );
}

/**
 * Helper alias exported alongside, so consumers don't have to know about
 * MotionValue plumbing if they only want to render static content inside.
 */
export const ScrollSceneLayer = motion.div;
