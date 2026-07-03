"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useMotionValueEvent } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { Wordmark } from "./wordmark";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/cn";

type NavKey = "atelier" | "collection" | "about" | "contact";
type NavHref = "/about" | "/collection" | "/contact";

// Left of the wordmark
const leftNav: Array<{ key: NavKey; href: NavHref }> = [
  { key: "atelier", href: "/about" },
  { key: "collection", href: "/collection" },
];

// Right of the wordmark (the CTA + locale switch follow)
const rightNav: Array<{ key: NavKey; href: NavHref }> = [
  { key: "contact", href: "/contact" },
];

/**
 * ~0.4s expo-out. Tailwind's `transition` set covers color / background /
 * opacity / filter / transform only (no layout). The global reduced-motion
 * rule collapses the duration, so the state still flips — just without easing.
 */
const SCROLL_TRANSITION = "transition duration-[400ms] ease-[var(--ease-out-expo)]";

/** Refined nav link — body sans, small-caps, generous tracking. */
const navLink =
  "text-[0.8125rem] font-medium uppercase tracking-[0.16em] opacity-80 transition-opacity duration-300 hover:opacity-100";

// Run the scroll measurement before paint on the client (avoids a colour flash
// on the home hero); fall back to useEffect during SSR.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Site header — fixed, full width.
 *
 * Layout (desktop ≥1024px): ATELIER · COLLECTION | DABBAS (dead-centre)
 *                           | CONTACT · BOOK AN APPOINTMENT · EN / AR
 * Below 1024px: hamburger (full-screen overlay nav, which carries the CTA)
 * + wordmark + EN/AR. The overlay covers tablets too — the centred wordmark
 * leaves no room for both nav wings between 768–1023px.
 *
 * Colour behaviour: over the hero the header floats transparent with LIGHT
 * (porcelain) text; once the hero has nearly scrolled past — or immediately on
 * pages with no hero — it becomes a solid porcelain bar (faint frost + a mist
 * hairline) with DARK (ink) text. The inversion rides on `currentColor`, so
 * every descendant transitions together.
 */
export function Header() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // `light` → transparent header (NO background) with light text, floating over
  // the hero so the image fills the whole section behind it. The solid
  // background only appears after scroll.
  //
  // Only the home page carries the full-bleed hero, and it's always 100svh — so
  // we flip ~one header-height before it scrolls away, derived from the viewport
  // height. We deliberately DON'T query the hero element: the home page streams
  // in after the header mounts, so on first paint it isn't in the DOM yet — that
  // timing gap was what left the bar white on load until a resize.
  const isHeroPage = pathname === "/";
  const [light, setLight] = useState(isHeroPage);
  const { scrollY } = useScroll();

  useIsoLayoutEffect(() => {
    const update = () =>
      setLight(isHeroPage && window.scrollY < window.innerHeight - 80);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isHeroPage]);

  useMotionValueEvent(scrollY, "change", (y) => {
    setLight(isHeroPage && y < window.innerHeight - 80);
  });

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-20">
        {/* No scrim/tint — the header is fully transparent over the hero.
            Solid surface — porcelain (white) — only after scroll. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-porcelain/85 backdrop-blur-[12px]",

            SCROLL_TRANSITION,
            light ? "opacity-0" : "opacity-100",
          )}
        />
        {/* Bottom hairline */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-px bg-mist",
            SCROLL_TRANSITION,
            light ? "opacity-0" : "opacity-100",
          )}
        />

        {/* Content — currentColor carries the light↔dark inversion. */}
        <div
          className={cn(
            "relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-10",
            SCROLL_TRANSITION,
            light ? "text-porcelain" : "text-ink",
          )}
        >
          {/* LEFT of centre: ATELIER · COLLECTION (+ mobile hamburger) */}
          <div className="flex items-center gap-8">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-8 lg:flex"
            >
              {leftNav.map((item) => (
                <Link key={item.key} href={item.href} className={navLink}>
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("menu")}
              className="-ms-2.5 flex h-11 w-11 items-center justify-center opacity-90 transition-opacity hover:opacity-100 lg:hidden"
            >
              <MenuIcon />
            </button>
          </div>

          {/* CENTRE: wordmark — dead-centre on the page, fashion-house masthead */}
          <Wordmark
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "whitespace-nowrap !text-current",
              "text-[1.5rem] tracking-[0.3em] sm:text-[2rem] sm:tracking-[0.35em] lg:text-[2.25rem]",
            )}
          />

          {/* RIGHT of centre: CONTACT · BOOK AN APPOINTMENT · EN / AR */}
          <div className="flex items-center justify-end gap-7">
            <nav
              aria-label="Secondary"
              className="hidden items-center gap-7 lg:flex"
            >
              {rightNav.map((item) => (
                <Link key={item.key} href={item.href} className={navLink}>
                  {t(`nav.${item.key}`)}
                </Link>
              ))}

              {/* The single conversion goal — a hairline-bordered CTA that
                  rides currentColor, so it inverts with the header. Gold
                  arrives only on hover, like jewelry catching light. */}
              <Link
                href="/contact"
                className={cn(
                  "inline-flex items-center border border-current/30 px-5 py-2.5",
                  "text-[0.8125rem] font-medium uppercase tracking-[0.16em]",
                  "transition-colors duration-[600ms] ease-[var(--ease-out-expo)]",
                  "hover:border-gold hover:bg-gold/10",
                )}
              >
                {t("cta")}
              </Link>
            </nav>

            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/** Two thin hairlines — a menu mark in keeping with the atelier's restraint. */
function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden
      className="h-6 w-6"
    >
      <path d="M3.5 9h17M3.5 15h17" />
    </svg>
  );
}
