import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  // /en/about and /ar/about — always show the prefix so the path tells you
  // which language you are reading. Easier mental model for marketing/SEO.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
