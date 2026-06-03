import { logoutAction } from "../login/actions";
import { AdminSidebar } from "./admin-sidebar";

function SignOut() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-graphite transition-colors hover:bg-mist/60 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h12" />
        </svg>
        Sign out
      </button>
    </form>
  );
}

/**
 * Admin chrome — a left sidebar (desktop) / top bar (mobile) with section
 * navigation, and a content area to its right. Each admin page wraps its
 * content in <AdminShell>; pass `title` (+ optional `action`) for a consistent
 * page header.
 */
export function AdminShell({
  children,
  title,
  eyebrow,
  action,
  width = "wide",
}: {
  children: React.ReactNode;
  title?: string;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  /** Content max-width. "narrow" suits forms; "wide" suits lists. */
  width?: "narrow" | "wide";
}) {
  return (
    <div className="min-h-screen md:pl-60">
      <AdminSidebar signOut={<SignOut />} />

      <main className="px-5 py-8 sm:px-8 sm:py-10">
        <div className={width === "narrow" ? "mx-auto max-w-2xl" : "mx-auto max-w-5xl"}>
          {(title || action) && (
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-mist pb-6">
              <div>
                {eyebrow && (
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  <h1 className="mt-1.5 font-[family-name:var(--font-display)] text-3xl text-ink">
                    {title}
                  </h1>
                )}
              </div>
              {action}
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
