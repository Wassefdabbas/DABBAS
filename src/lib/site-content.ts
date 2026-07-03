/**
 * Site Content store — editable from /admin/site.
 *
 * Single Mongo document (`_id: "main"`) holds every "slot" that the public
 * pages render: hero media, the Our Craft image, the Heritage image, and
 * the About page editorial break. Reads fall back to defaults so the site
 * stays alive when Mongo is unconfigured or the doc hasn't been created.
 *
 * Hero supports image OR video; every other slot is image-only.
 */

import type { BrandImage } from "./images";
import { getDb } from "./mongo";

/* ---------------------------------------------------------------- types -- */

export type VideoProvider = "drive" | "cloudinary";

export type MediaImage = { kind: "image"; image: BrandImage };

export type MediaVideo = {
  kind: "video";
  /** drive: Drive file ID. cloudinary: video public_id. */
  source: { provider: VideoProvider; id: string };
  /** Optional still frame shown while the video loads. */
  poster?: BrandImage | null;
  /** Accessible description (also used as <video aria-label>). */
  alt?: string;
};

export type Media = MediaImage | MediaVideo | null;

/** Editable atelier contact details (overrides src/lib/contact.ts defaults). */
export type ContactInfo = {
  email: string;
  whatsappNumber: string;   // digits only, no '+',
  whatsappDisplay: string;  // human format, e.g. "+963 9XX XXX XXX"
  instagram: string;        // full URL
};

export type SiteContent = {
  /** Full-bleed hero on the homepage. Image OR video. */
  hero: Media;
  /** Pinned scene image on the homepage's "Our Craft" section. */
  craft: MediaImage | null;
  /** Split-layout image on the homepage's Heritage section. */
  heritage: MediaImage | null;
  /** Editorial image break on the /about page (between hero + sections). */
  aboutBreak: MediaImage | null;
  /** Phone / email / Instagram. Empty strings mean "use the code defaults". */
  contact: ContactInfo;
  /** Up to 4 veil slugs shown in the Featured Veils grid on the homepage.
   *  Empty array → fall back to the first 4 veils by DB order. */
  featuredSlugs: string[];
};

const defaults: SiteContent = {
  hero: null,
  craft: null,
  heritage: null,
  aboutBreak: null,
  contact: {
    email: "",
    whatsappNumber: "",
    whatsappDisplay: "",
    instagram: "",
  },
  featuredSlugs: [],
};

/* ------------------------------------------------------------- internals -- */

const COLLECTION_NAME = "siteContent";
const DOC_ID = "main";

import type { Db } from "mongodb";

type SiteContentDoc = SiteContent & { _id: string };
function siteCol(db: Db) {
  return db.collection<SiteContentDoc>(COLLECTION_NAME);
}

/* ----------------------------------------------------------------- api -- */

/**
 * Optional env-var overrides — useful when Mongo is unreachable but you
 * want the hero / sections to render with a known media reference.
 *
 *   HERO_DRIVE_ID=<drive-file-id>      → hero uses this Drive image
 *   HERO_CLOUDINARY_ID=<public-id>     → hero uses this Cloudinary image
 *
 * If both are set, Cloudinary wins. Either trumps whatever's in Mongo.
 */
function envHeroOverride(): MediaImage | null {
  const driveId = process.env.HERO_DRIVE_ID;
  const cloudId = process.env.HERO_CLOUDINARY_ID;
  if (cloudId) {
    return {
      kind: "image",
      image: {
        src: { kind: "cloudinary", publicId: cloudId },
        alt: "DABBAS hero",
      },
    };
  }
  if (driveId) {
    return {
      kind: "image",
      image: {
        src: { kind: "drive", id: driveId },
        alt: "DABBAS hero",
      },
    };
  }
  return null;
}

export async function getSiteContent(): Promise<SiteContent> {
  const heroOverride = envHeroOverride();
  try {
    const db = await getDb();
    if (!db) {
      return heroOverride
        ? { ...defaults, hero: heroOverride }
        : defaults;
    }
    const doc = await siteCol(db).findOne({ _id: DOC_ID });
    if (!doc) {
      return heroOverride
        ? { ...defaults, hero: heroOverride }
        : defaults;
    }
    const { _id, ...content } = doc;
    void _id;
    // Merge with defaults so older docs missing `contact` (or any future
    // field we add) read consistently. Env-var hero override (if any)
    // takes precedence over Mongo so it can be used to bypass connection
    // issues without changing data.
    return {
      ...defaults,
      ...content,
      hero: heroOverride ?? content.hero ?? null,
      contact: { ...defaults.contact, ...(content.contact ?? {}) },
      featuredSlugs: content.featuredSlugs ?? [],
    } as SiteContent;
  } catch (e) {
    console.error("Site content read failed, using defaults:", e);
    return heroOverride
      ? { ...defaults, hero: heroOverride }
      : defaults;
  }
}

export async function updateSiteContent(content: SiteContent): Promise<void> {
  const db = await getDb();
  if (!db)
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in .env.local before saving.",
    );
  // replaceOne strips _id from the replacement type
  await siteCol(db).replaceOne({ _id: DOC_ID }, content, { upsert: true });
}
