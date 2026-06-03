"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { easeOutExpo } from "@/lib/motion";

/**
 * Route template — re-mounts on every navigation, allowing a soft veil-fade
 * between pages. Reduced motion skips the fade entirely.
 *
 * NOTE: template.tsx runs INSIDE the locale layout, so the header/footer
 * remain mounted; only the page body crossfades.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}
