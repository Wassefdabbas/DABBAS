import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Cormorant_Garamond,
  Inter,
  Amiri,
  Noto_Naskh_Arabic,
  Italianno,
} from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

const displaySerif = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const bodySans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Calligraphic Arabic for headings & labels — Amiri, regular weight only so
// headlines read like calligraphy, never newspaper-bold.
const arabicDisplay = Amiri({
  variable: "--font-arabic-display",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});

// Highly readable Naskh for Arabic body copy.
const arabicBody = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400"],
  display: "swap",
});

const scriptFont = Italianno({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dabbas-atelier.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.intro" });
  const description = t("headline");

  // Alternate-language map for hreflang
  const languages: Record<string, string> = {};
  for (const alt of routing.locales) languages[alt] = `${SITE_URL}/${alt}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: "%s — DABBAS",
      default: "DABBAS",
    },
    description,
    applicationName: "DABBAS",
    keywords: [
      "wedding veil",
      "bridal atelier",
      "handmade",
      "Damascus",
      "silk tulle",
      "DABBAS",
    ],
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${locale}`,
      siteName: "DABBAS",
      title: "DABBAS",
      description,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SY"],
    },
    twitter: {
      card: "summary_large_image",
      title: "DABBAS",
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for child server components
  setRequestLocale(locale);

  // Keep the layout in LTR for every locale — Arabic swaps the words/fonts but
  // the page direction and composition stay identical to English (no mirroring).
  return (
    <html
      lang={locale}
      dir="ltr"
      className={`${displaySerif.variable} ${bodySans.variable} ${arabicDisplay.variable} ${arabicBody.variable} ${scriptFont.variable}`}
    >
      <body className="min-h-screen bg-porcelain text-graphite">
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            <Header />
            {children}
            <Footer />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
