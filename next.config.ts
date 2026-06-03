import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /*
   * Cloudinary cloud name + API key are needed on BOTH server (URL
   * builders, signing route) and client (the upload widget). Next requires
   * `NEXT_PUBLIC_*` for client access — the `env` block here is the
   * escape hatch: it inlines these two values into the client bundle at
   * build time, letting us keep the cleaner CLOUDINARY_* var names.
   *
   * CLOUDINARY_API_SECRET is intentionally NOT in this block — it stays
   * server-only (used only by /api/admin/cloudinary-sign).
   */
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
  },
  images: {
    // Defaults + 320 so the mobile hero crop can be pinned to a 320px-wide
    // render (see src/app/[locale]/_sections/hero.tsx).
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384],
    // Allow a higher quality than the default 75 (used by the desktop hero).
    qualities: [75, 90],
    remotePatterns: [
      // Google Drive — "fast iteration" upload path
      { protocol: "https", hostname: "drive.google.com" },
      // Drive sometimes 302s thumbnails to googleusercontent
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Cloudinary — production CDN path
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Pinterest — direct image host
      { protocol: "https", hostname: "i.pinimg.com" },
      // Generic any-image-URL escape hatch (the `url` BrandImage kind)
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    // Baseline security headers on every route. (No strict CSP — image hosts
    // like Cloudinary/Drive + inline styles would need careful allow-listing;
    // add later once sources are locked down.)
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Phase 6 dropped /appointment in favor of /contact. Permanently send
    // any old links to the contact page (locale-prefixed and bare).
    return [
      {
        source: "/:locale(en|ar)/appointment",
        destination: "/:locale/contact",
        permanent: true,
      },
      {
        source: "/appointment",
        destination: "/contact",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
