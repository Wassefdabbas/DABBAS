"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns `false` on the server and on the first
 * client render, then tracks the query after mount.
 *
 * Used to *gate the mounting* of GPU-heavy, desktop-only effects — chiefly the
 * hero's `backdrop-filter` glass — so they are never rendered on phones (no
 * `display:none` leftover, zero GPU cost). On desktop the effect mounts just
 * after hydration, which doubles as its "settle in on load" entrance.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}
