import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const bodySans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Root 404 — for requests outside any locale (the locale layout doesn't
 * mount). Needs its own html/body since the root layout is a pass-through.
 * EN-only because we don't know the user's locale at this point.
 */
export default function RootNotFound() {
  return (
    <html lang="en" dir="ltr" className={bodySans.variable}>
      <body className="min-h-screen bg-porcelain text-graphite">
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="small-caps mb-6">404</p>
          <h1 className="max-w-2xl font-[family-name:var(--font-sans)] text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-ink">
            This thread leads nowhere.
          </h1>
          <p className="mt-8 max-w-md text-graphite">
            The page you were looking for isn&apos;t here.
          </p>
          <Link
            href="/en"
            className="small-caps mt-12 inline-flex items-center gap-3 border-b border-gold pb-1 !text-ink transition-colors hover:!text-gold-deep"
          >
            Back to home
            <span aria-hidden>&rarr;</span>
          </Link>
        </main>
      </body>
    </html>
  );
}
