import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const bodySans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin — DABBAS",
  robots: { index: false, follow: false },
};

/**
 * Admin tree has its own root layout (html/body). No Lenis, no fancy
 * animations — admin is utilitarian. Single language (English-only chrome).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={bodySans.variable}>
      <body className="min-h-screen bg-porcelain text-graphite">
        {children}
      </body>
    </html>
  );
}
