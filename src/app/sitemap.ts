import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllSlugs } from "@/lib/collection";
import { getCategories } from "@/lib/categories";

/**
 * Sitemap covers the public site only — every static route × every locale,
 * plus one entry per collection veil × locale. Admin is robots-blocked
 * (see robots.ts) so we don't emit those URLs here.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dabbas-atelier.com";

const staticRoutes: Array<{ path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "",            priority: 1.0, changeFreq: "monthly" },
  { path: "/collection", priority: 0.9, changeFreq: "weekly" },
  { path: "/about",      priority: 0.7, changeFreq: "monthly" },
  { path: "/contact",    priority: 0.8, changeFreq: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories] = await Promise.all([
    getAllSlugs(),
    getCategories(),
  ]);
  const now = new Date();

  const out: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFreq } of staticRoutes) {
    for (const locale of routing.locales) {
      const url = `${SITE_URL}/${locale}${path}`;
      const alternates: Record<string, string> = {};
      for (const alt of routing.locales) {
        alternates[alt] = `${SITE_URL}/${alt}${path}`;
      }
      out.push({
        url,
        lastModified: now,
        changeFrequency: changeFreq,
        priority,
        alternates: { languages: alternates },
      });
    }
  }

  for (const cat of categories) {
    for (const locale of routing.locales) {
      const path = `/collection/category/${cat.slug}`;
      const url = `${SITE_URL}/${locale}${path}`;
      const alternates: Record<string, string> = {};
      for (const alt of routing.locales) {
        alternates[alt] = `${SITE_URL}/${alt}${path}`;
      }
      out.push({
        url,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  for (const slug of slugs) {
    for (const locale of routing.locales) {
      const url = `${SITE_URL}/${locale}/collection/${slug}`;
      const alternates: Record<string, string> = {};
      for (const alt of routing.locales) {
        alternates[alt] = `${SITE_URL}/${alt}/collection/${slug}`;
      }
      out.push({
        url,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: alternates },
      });
    }
  }

  return out;
}
