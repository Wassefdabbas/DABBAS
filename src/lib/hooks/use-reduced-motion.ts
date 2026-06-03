"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe prefers-reduced-motion hook.
 * Default is `false` on the server so SSR markup matches the no-motion fallback
 * only when the user has opted in client-side. CSS still enforces the kill
 * switch globally — this hook is for JS-driven animations (Lenis, GSAP, Motion).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return reduced;
}
