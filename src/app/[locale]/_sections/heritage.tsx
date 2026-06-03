"use client";

import { useTranslations } from "next-intl";
import { Parallax, RevealImage, RevealText } from "@/components/motion";
import { PaintedTile } from "@/components/painted-tile";
import { BrandMedia } from "@/components/brand-media";
import { Link } from "@/i18n/navigation";
import type { MediaImage } from "@/lib/site-content";

/**
 * Heritage / The Atelier — split layout. Image left in LTR (auto-flips in
 * RTL via CSS), copy right. The image sits on a slow parallax so the panel
 * feels alive as you scroll past it.
 */
export function Heritage({ media }: { media: MediaImage | null }) {
  const t = useTranslations("Home.heritage");

  return (
    <section
      aria-label="Heritage"
      className="bg-pearl px-6 py-32 sm:px-12 sm:py-40 lg:px-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Image side */}
        <div className="relative">
          <RevealImage className="aspect-[4/5] w-full" direction="bottom">
            <Parallax speed={0.25} className="h-full w-full">
              <BrandMedia
                media={media}
                sizes="(min-width: 1024px) 50vw, 100vw"
                fallback={<PaintedTile variant="atelier" />}
              />
            </Parallax>
          </RevealImage>
        </div>

        {/* Copy side */}
        <div>
          <p className="small-caps mb-5">{t("eyebrow")}</p>
          <RevealText
            as="h2"
            text={t("headline")}
            className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] text-ink"
          />
          <RevealText
            as="p"
            text={t("body")}
            className="mt-6 max-w-md text-base leading-relaxed text-graphite"
            staggerChildren={0.03}
          />

          <Link
            href="/about"
            className="small-caps mt-10 inline-flex items-center gap-3 border-b border-gold pb-1 !text-ink transition-colors hover:!text-gold-deep"
          >
            {t("cta")}
            <span aria-hidden className="rtl:rotate-180">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
