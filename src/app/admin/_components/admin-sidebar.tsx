"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matches: (p: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: "/admin",
    label: "Veils",
    matches: (p) => p === "/admin" || p.startsWith("/admin/veils"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M12 3C8 7 6 10 6 14a6 6 0 0 0 12 0c0-4-2-7-6-11Z" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    matches: (p) => p.startsWith("/admin/categories"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    href: "/admin/appointments",
    label: "Appointments",
    matches: (p) => p.startsWith("/admin/appointments"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="m3 7 9 7 9-7" />
      </svg>
    ),
  },
  {
    href: "/admin/site",
    label: "Site & contact",
    matches: (p) => p.startsWith("/admin/site"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
    ),
  },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.matches(pathname);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-ink text-porcelain"
          : "text-graphite hover:bg-mist/60 hover:text-ink",
      )}
    >
      <span className={active ? "text-gold-soft" : "text-muted"}>{item.icon}</span>
      {item.label}
    </Link>
  );
}

/**
 * Admin navigation. Renders a fixed left sidebar on desktop and a horizontal
 * scrolling bar on mobile — same links, same active state.
 */
export function AdminSidebar({ signOut }: { signOut: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-mist bg-porcelain px-4 py-6 md:flex">
        <Link
          href="/admin"
          className="px-3 font-[family-name:var(--font-display)] text-lg tracking-[0.18em] text-ink"
        >
          DABBAS
          <span className="mt-0.5 block text-[0.6875rem] tracking-[0.22em] text-muted">
            ADMIN
          </span>
        </Link>

        <nav aria-label="Admin sections" className="mt-10 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="mt-auto border-t border-mist pt-4">{signOut}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-mist bg-porcelain md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-display)] text-base tracking-[0.18em] text-ink"
          >
            DABBAS · ADMIN
          </Link>
          {signOut}
        </div>
        <nav
          aria-label="Admin sections"
          className="flex items-center gap-1 overflow-x-auto px-2 pb-2"
        >
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
      </header>
    </>
  );
}
