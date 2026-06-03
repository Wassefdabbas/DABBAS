import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export const alt = "DABBAS Atelier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Brand-aligned OG image. Locale-aware: pulls the intro headline from
 * next-intl so EN and AR share an OG but each gets their own tagline.
 *
 * Default Satori font is a sans-serif fallback. We use it for the tagline;
 * the wordmark gets `letterSpacing` + uppercase to read as the brand.
 */
export default async function OG({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.intro" });
  const tagline = t("headline");

  const isRtl = locale === "ar";

  // Brand tokens (must be literal hex here — Satori doesn't parse CSS vars)
  const porcelain = "#FDFCFA";
  const ink = "#1C1A17";
  const muted = "#8A8378";
  const gold = "#B79257";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: porcelain,
          padding: 96,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top hairline */}
        <div style={{ width: 96, height: 1, background: gold, marginBottom: 56 }} />

        {/* Small-caps eyebrow */}
        <div
          style={{
            color: muted,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            fontSize: 22,
            marginBottom: 32,
          }}
        >
          {isRtl ? "دبّاس أتيلييه" : "DABBAS Atelier"}
        </div>

        {/* Wordmark */}
        <div
          style={{
            color: ink,
            fontSize: 200,
            fontWeight: 400,
            letterSpacing: isRtl ? "0.06em" : "0.16em",
            lineHeight: 1,
            marginBottom: 56,
          }}
        >
          {isRtl ? "دبّاس" : "DABBAS"}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: ink,
            fontSize: 36,
            maxWidth: 880,
            textAlign: "center",
            lineHeight: 1.3,
            // For Arabic the engine needs RTL direction
            direction: isRtl ? "rtl" : "ltr",
          }}
        >
          {tagline}
        </div>

        {/* Bottom hairline */}
        <div style={{ width: 96, height: 1, background: gold, marginTop: 56 }} />
      </div>
    ),
    size,
  );
}
