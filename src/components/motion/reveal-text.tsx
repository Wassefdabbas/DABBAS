"use client";

import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import {
  easeOutExpo,
  revealDurations,
  stagger as staggerCfg,
} from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

type Props = {
  text: string;
  as?: Tag;
  className?: string;
  /** Delay before first word starts (s). */
  delay?: number;
  /** Override word stagger (s per word). */
  staggerChildren?: number;
  /** Once-only on enter view. Default true. */
  once?: boolean;
  /** Viewport margin sensitivity (Motion viewport.margin). */
  margin?: string;
};

const motionTag = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

/**
 * <RevealText>
 * Splits a string into words, masks each word, and reveals them with a
 * staggered translateY-from-below. The brand's signature heading entrance.
 *
 * - `text` is required (we never reach into children to read text content —
 *   keeps SSR output stable and avoids DOM walking).
 * - Reduced motion: renders the plain tag with the full text, no animation.
 * - A11y: original text is kept on an aria-label so screen readers read once;
 *   the masked word spans are aria-hidden.
 */
export function RevealText({
  text,
  as = "h2",
  className,
  delay = 0,
  staggerChildren = staggerCfg.words,
  once = true,
  margin = "-15%",
}: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{text}</Plain>;
  }

  // Split keeping whitespace so spaces render between words.
  const parts = text.split(/(\s+)/);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren: delay },
    },
  };

  const word: Variants = {
    hidden: { y: "115%" },
    visible: {
      y: "0%",
      transition: { duration: revealDurations.text, ease: easeOutExpo },
    },
  };

  const Tag = motionTag[as];

  return (
    <Tag
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}%` }}
      aria-label={text}
    >
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) {
          return (
            <span key={i} aria-hidden>
              {part}
            </span>
          );
        }
        return (
          <span key={i} className="word-mask" aria-hidden>
            <motion.span variants={word} className="inline-block will-change-transform">
              {part}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
