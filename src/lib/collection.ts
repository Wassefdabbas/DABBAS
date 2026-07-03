/**
 * Collection data layer.
 *
 * Reads from MongoDB when `MONGODB_URI` is configured; otherwise falls back
 * to the hardcoded sample veils below. The sample also acts as the seed
 * the admin can copy into Mongo via the "Seed sample veils" action.
 *
 * The async signatures intentionally match either backend — pages don't
 * need to know where the data came from.
 */

import type { BrandImage } from "./images";
import type { Locale } from "@/i18n/routing";
import { getDb } from "./mongo";
import { filterByCategory } from "./category-filter";

/* ---------------------------------------------------------------- types -- */

export type Localized = { en: string; ar: string };

export type VeilDetail = {
  title: Localized;
  body: Localized;
};

/**
 * Structured, single-line spec fields shown on the detail page as a quiet
 * definition list. All optional — only the ones the admin fills in render.
 * Ordered here the way they appear on the page.
 */
export type VeilSpecs = {
  material?: Localized;
  lace?: Localized;
  decoration?: Localized;
  silhouette?: Localized;
  color?: Localized;
  designer?: Localized;
};

/** The spec keys in display order — the single source of truth for both the
 *  admin form and the detail page. */
export const SPEC_KEYS = [
  "material",
  "lace",
  "decoration",
  "silhouette",
  "color",
  "designer",
] as const;
export type SpecKey = (typeof SPEC_KEYS)[number];

export type Veil = {
  slug: string;
  name: Localized;
  lineLabel: Localized;
  cover: BrandImage;
  gallery: BrandImage[];
  /** Short description shown on the detail page. */
  description: Localized;
  /** Structured single-line specs (material, lace, …) — optional. */
  specs?: VeilSpecs | null;
  details: VeilDetail[];
  /** Slugs of other veils that complete a bridal look. */
  completeYourLook: string[];
  /** Slugs of stylistically similar veils. */
  youMayAlsoLike: string[];
  /**
   * Optional price — bilingual so the atelier can write e.g.
   *   { en: "From $1,200", ar: "ابتداءً من ١٢٠٠ دولار" }
   * Set to null/omit to hide pricing on the detail page.
   */
  price?: Localized | null;
  /** Optional reference to a Category by slug. */
  categorySlug?: string | null;
};

/** Read a localized string for the active locale, with EN fallback. */
export function pickL(value: Localized, locale: Locale): string {
  return value[locale] ?? value.en;
}

const COLLECTION_NAME = "veils";

/**
 * Mongo document shape: same as Veil but with `_id: string` (slug). Using
 * the slug as _id keeps lookups single-key and avoids a unique index.
 */
type VeilDoc = Veil & { _id: string };

import type { Db } from "mongodb";
function veilsCol(db: Db) {
  return db.collection<VeilDoc>(COLLECTION_NAME);
}

/**
 * Internal: read all veils from Mongo.
 * - Returns the documents (possibly an EMPTY array) when the DB is reachable —
 *   an empty collection means "the admin deleted everything", NOT "show samples".
 * - Returns `null` only when Mongo isn't configured / can't be reached, so the
 *   caller can decide on a fallback.
 */
async function readFromMongo(): Promise<Veil[] | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const docs = await veilsCol(db).find({}).toArray();
    // Strip the Mongo _id from the public shape. An empty array is returned
    // as-is (not null) so deleted veils stay deleted.
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      void _id; // drop the Mongo _id from the public shape
      return rest as Veil;
    });
  } catch (e) {
    console.error("Mongo read failed:", e);
    return null;
  }
}

/* ----------------------------------------------------------- sample data -- */

// Painted-placeholder helper. Returns a BrandImage that <BrandImage> will
// render as its painted fallback (Cloudinary cloud unset).
function paintedRef(altEn: string): BrandImage {
  return {
    src: { kind: "cloudinary", publicId: `placeholder-${altEn}` },
    alt: altEn,
    aspect: "4 / 5",
  };
}

const veils: Veil[] = [
  {
    slug: "voile",
    name: { en: "Voile", ar: "فوال" },
    lineLabel: { en: "Cathedral length", ar: "بطول الكاتدرائية" },
    cover: paintedRef("Voile cover"),
    gallery: [
      paintedRef("Voile, walked"),
      paintedRef("Voile, edge detail"),
      paintedRef("Voile, atelier"),
      paintedRef("Voile, full length"),
    ],
    description: {
      en: "Three metres of fine silk tulle, hand-rolled at the edge. A cathedral-length veil that floats long after the wearer has settled.",
      ar: "ثلاثة أمتار من تول الحرير الناعم، مطوية باليد عند الحافة. طرحة بطول الكاتدرائية تطفو بهدوء بعد أن تستقر العروس.",
    },
    details: [
      {
        title: { en: "Materials", ar: "الخامات" },
        body: {
          en: "100% silk tulle, sourced in Como.",
          ar: "تول حريري ١٠٠٪، من مدينة كومو.",
        },
      },
      {
        title: { en: "Length", ar: "الطول" },
        body: {
          en: "300 cm from the comb to the hem.",
          ar: "٣٠٠ سم من المشط حتى الحافة.",
        },
      },
      {
        title: { en: "Finishing", ar: "اللمسة الأخيرة" },
        body: {
          en: "Hand-rolled edge, no machine seam.",
          ar: "حافة مطوية باليد، دون أي درز ميكانيكي.",
        },
      },
      {
        title: { en: "Care", ar: "العناية" },
        body: {
          en: "Hang in a cool, dry place. Steam only — never iron silk tulle directly.",
          ar: "تُعلَّق في مكان جاف وبارد. يُستخدم البخار فقط — لا تُكوى مباشرة.",
        },
      },
      {
        title: { en: "Lead time", ar: "مدة التنفيذ" },
        body: {
          en: "6–8 weeks from the first measurement.",
          ar: "من ٦ إلى ٨ أسابيع من أول قياس.",
        },
      },
    ],
    completeYourLook: ["couronne", "etoile"],
    youMayAlsoLike: ["soie", "dentelle", "aube"],
    categorySlug: "cathedral",
  },
  {
    slug: "soie",
    name: { en: "Soie", ar: "حرير" },
    lineLabel: { en: "Silk tulle", ar: "تول حريري" },
    cover: paintedRef("Soie cover"),
    gallery: [
      paintedRef("Soie, daylight"),
      paintedRef("Soie, drape"),
      paintedRef("Soie, comb"),
    ],
    description: {
      en: "A weightless fingertip veil cut from a single panel of silk tulle. The most quiet thing we make.",
      ar: "طرحة بطول الأصابع، خفيفة كالنفَس، مقطوعة من قطعة واحدة من تول الحرير. أهدأ ما نصنعه.",
    },
    details: [
      {
        title: { en: "Materials", ar: "الخامات" },
        body: {
          en: "100% silk tulle.",
          ar: "تول حريري ١٠٠٪.",
        },
      },
      {
        title: { en: "Length", ar: "الطول" },
        body: {
          en: "Fingertip — approximately 110 cm.",
          ar: "بطول الأصابع — حوالي ١١٠ سم.",
        },
      },
      {
        title: { en: "Finishing", ar: "اللمسة الأخيرة" },
        body: {
          en: "Raw cut. No edge treatment — the silk holds itself.",
          ar: "قصّ خام. دون معالجة للحافة — الحرير يحفظ نفسه.",
        },
      },
      {
        title: { en: "Lead time", ar: "مدة التنفيذ" },
        body: {
          en: "4–6 weeks.",
          ar: "من ٤ إلى ٦ أسابيع.",
        },
      },
    ],
    completeYourLook: ["couronne"],
    youMayAlsoLike: ["aube", "voile"],
    categorySlug: "signature",
  },
  {
    slug: "dentelle",
    name: { en: "Dentelle", ar: "دانتيل" },
    lineLabel: { en: "Hand-tatted lace", ar: "دانتيل يدوي" },
    cover: paintedRef("Dentelle cover"),
    gallery: [
      paintedRef("Dentelle, full"),
      paintedRef("Dentelle, lace detail"),
      paintedRef("Dentelle, side"),
      paintedRef("Dentelle, edge"),
    ],
    description: {
      en: "A chapel-length veil with a hand-tatted lace trim worked in the atelier. The lace is finished by a single pair of hands across roughly forty hours.",
      ar: "طرحة بطول الكنيسة بحاشية دانتيل مشغولة باليد داخل الدار. تُنجَز الدانتيلا على يد واحدة في نحو أربعين ساعة.",
    },
    details: [
      {
        title: { en: "Materials", ar: "الخامات" },
        body: {
          en: "Silk tulle with hand-tatted cotton lace trim.",
          ar: "تول حريري مع حاشية دانتيل قطنية مشغولة باليد.",
        },
      },
      {
        title: { en: "Length", ar: "الطول" },
        body: {
          en: "Chapel — approximately 230 cm.",
          ar: "بطول الكنيسة — حوالي ٢٣٠ سم.",
        },
      },
      {
        title: { en: "Lace pattern", ar: "نقشة الدانتيل" },
        body: {
          en: "Floral motif, drawn for the house in 1981.",
          ar: "نقشة زهرية، رُسمت للدار عام ١٩٨١.",
        },
      },
      {
        title: { en: "Lead time", ar: "مدة التنفيذ" },
        body: {
          en: "10–12 weeks.",
          ar: "من ١٠ إلى ١٢ أسبوعًا.",
        },
      },
    ],
    completeYourLook: ["couronne", "etoile"],
    youMayAlsoLike: ["voile", "etoile"],
    categorySlug: "romance",
  },
  {
    slug: "couronne",
    name: { en: "Couronne", ar: "تاج" },
    lineLabel: { en: "Crown blusher", ar: "طرحة بتاج" },
    cover: paintedRef("Couronne cover"),
    gallery: [
      paintedRef("Couronne, crown"),
      paintedRef("Couronne, blusher"),
      paintedRef("Couronne, profile"),
    ],
    description: {
      en: "A two-tier blusher fixed at a small crown of pearl-headed pins. Sits low on the brow, lifts cleanly at the altar.",
      ar: "طرحة من طبقتين تُثبَّت بتاج صغير من دبابيس برأس لؤلؤي. تنسدل على الجبين وتُرفَع بسهولة عند المذبح.",
    },
    details: [
      {
        title: { en: "Materials", ar: "الخامات" },
        body: {
          en: "Silk tulle, freshwater pearls on hand-forged brass pins.",
          ar: "تول حريري، ولؤلؤ مياه عذبة على دبابيس نحاسية مطروقة باليد.",
        },
      },
      {
        title: { en: "Length", ar: "الطول" },
        body: {
          en: "Shoulder and chest — 60 cm / 90 cm tiers.",
          ar: "طبقتان: الكتف والصدر — ٦٠ سم و٩٠ سم.",
        },
      },
      {
        title: { en: "Lead time", ar: "مدة التنفيذ" },
        body: {
          en: "8 weeks.",
          ar: "٨ أسابيع.",
        },
      },
    ],
    completeYourLook: ["voile", "soie"],
    youMayAlsoLike: ["etoile"],
    categorySlug: "romance",
  },
  {
    slug: "etoile",
    name: { en: "Étoile", ar: "نجمة" },
    lineLabel: { en: "Pearl-set chapel", ar: "مطرّزة باللؤلؤ" },
    cover: paintedRef("Etoile cover"),
    gallery: [
      paintedRef("Etoile, full"),
      paintedRef("Etoile, pearl detail"),
      paintedRef("Etoile, draped"),
      paintedRef("Etoile, light"),
    ],
    description: {
      en: "Freshwater pearls hand-set across silk tulle in a scattered constellation. Heaviest of the line, but it carries quietly.",
      ar: "لآلئ مياه عذبة مطعّمة باليد على تول الحرير في توزيع يشبه كوكبة من النجوم. الأثقل في خطنا، لكنها تُحمَل بهدوء.",
    },
    details: [
      {
        title: { en: "Materials", ar: "الخامات" },
        body: {
          en: "Silk tulle, ~400 freshwater pearls hand-stitched.",
          ar: "تول حريري مع نحو ٤٠٠ لؤلؤة مياه عذبة مخيطة باليد.",
        },
      },
      {
        title: { en: "Length", ar: "الطول" },
        body: {
          en: "Chapel — 230 cm.",
          ar: "بطول الكنيسة — ٢٣٠ سم.",
        },
      },
      {
        title: { en: "Setting", ar: "التطعيم" },
        body: {
          en: "Pearls clustered at the comb, scattered toward the hem.",
          ar: "تتجمع اللآلئ عند المشط وتتناثر تجاه الحافة.",
        },
      },
      {
        title: { en: "Lead time", ar: "مدة التنفيذ" },
        body: {
          en: "12 weeks.",
          ar: "١٢ أسبوعًا.",
        },
      },
    ],
    completeYourLook: ["couronne"],
    youMayAlsoLike: ["dentelle", "voile"],
    categorySlug: "signature",
  },
  {
    slug: "aube",
    name: { en: "Aube", ar: "فجر" },
    lineLabel: { en: "Soft fingertip", ar: "بطول الأصابع" },
    cover: paintedRef("Aube cover"),
    gallery: [
      paintedRef("Aube, soft light"),
      paintedRef("Aube, side"),
      paintedRef("Aube, comb"),
    ],
    description: {
      en: "The lightest piece in the line — a single panel of soft tulle that drifts at the slightest movement. Named for first light.",
      ar: "أخف قطعة في الخط — قطعة واحدة من التول الناعم تتأرجح مع أبسط حركة. سُمّيت تيمنًا بضوء الفجر الأول.",
    },
    details: [
      {
        title: { en: "Materials", ar: "الخامات" },
        body: {
          en: "Soft polyester tulle (lighter than silk for travel weddings).",
          ar: "تول بوليستر ناعم (أخف من الحرير لأعراس السفر).",
        },
      },
      {
        title: { en: "Length", ar: "الطول" },
        body: {
          en: "Fingertip — 110 cm.",
          ar: "بطول الأصابع — ١١٠ سم.",
        },
      },
      {
        title: { en: "Lead time", ar: "مدة التنفيذ" },
        body: {
          en: "3–4 weeks — the fastest piece we make.",
          ar: "من ٣ إلى ٤ أسابيع — أسرع قطعة نصنعها.",
        },
      },
    ],
    completeYourLook: ["couronne"],
    youMayAlsoLike: ["soie", "voile"],
    categorySlug: "romance",
  },
];

/* ----------------------------------------------------------------- api -- */

/** Expose the seed data for the admin "Seed sample veils" action. */
export function getSampleVeils(): Veil[] {
  return veils;
}

export async function getVeils(): Promise<Veil[]> {
  return (await readFromMongo()) ?? veils;
}

export async function getVeilsByCategory(categorySlug: string): Promise<Veil[]> {
  return filterByCategory(await getVeils(), categorySlug);
}

export async function getVeil(slug: string): Promise<Veil | undefined> {
  const all = await getVeils();
  return all.find((v) => v.slug === slug);
}

export async function getFeaturedVeils(n = 6): Promise<Veil[]> {
  const all = await getVeils();
  return all.slice(0, n);
}

export async function getCompleteYourLook(slug: string): Promise<Veil[]> {
  const all = await getVeils();
  const veil = all.find((v) => v.slug === slug);
  if (!veil) return [];
  return veil.completeYourLook
    .map((s) => all.find((v) => v.slug === s))
    .filter((v): v is Veil => Boolean(v));
}

export async function getYouMayAlsoLike(slug: string): Promise<Veil[]> {
  const all = await getVeils();
  const veil = all.find((v) => v.slug === slug);
  if (!veil) return [];
  return veil.youMayAlsoLike
    .map((s) => all.find((v) => v.slug === s))
    .filter((v): v is Veil => Boolean(v));
}

/**
 * Used by `generateStaticParams`. Reads from Mongo if available so newly
 * added veils get static-generated routes; falls back to sample slugs.
 */
export async function getAllSlugs(): Promise<string[]> {
  const all = await getVeils();
  return all.map((v) => v.slug);
}

/* ------------------------------------------------------- admin writes -- */

/** Throws if Mongo isn't configured. Admin writes need the real DB. */
async function requireDb() {
  const db = await getDb();
  if (!db)
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in .env.local before writing.",
    );
  return db;
}

export async function createVeil(veil: Veil): Promise<void> {
  const db = await requireDb();
  await veilsCol(db).insertOne({ _id: veil.slug, ...veil });
}

export async function updateVeil(slug: string, veil: Veil): Promise<void> {
  const db = await requireDb();
  const col = veilsCol(db);
  // Slug change → delete old + insert new (so _id stays equal to slug)
  if (slug !== veil.slug) {
    await col.deleteOne({ _id: slug });
    await col.insertOne({ _id: veil.slug, ...veil });
    return;
  }
  // replaceOne strips _id from the replacement type — pass plain Veil
  await col.replaceOne({ _id: slug }, veil);
}

export async function deleteVeil(slug: string): Promise<void> {
  const db = await requireDb();
  await veilsCol(db).deleteOne({ _id: slug });
}

/** Copies the hardcoded sample into Mongo. Idempotent (skips existing). */
export async function seedSampleVeils(): Promise<{ inserted: number; skipped: number }> {
  const db = await requireDb();
  const col = veilsCol(db);
  const existing = await col.find({}, { projection: { _id: 1 } }).toArray();
  const existingIds = new Set(existing.map((d) => d._id));

  let inserted = 0;
  let skipped = 0;
  for (const veil of veils) {
    if (existingIds.has(veil.slug)) {
      skipped++;
      continue;
    }
    await col.insertOne({ _id: veil.slug, ...veil });
    inserted++;
  }
  return { inserted, skipped };
}
