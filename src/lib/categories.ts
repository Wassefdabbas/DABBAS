import type { Db } from "mongodb";
import { getDb } from "./mongo";
import type { Localized } from "./collection";

/**
 * Collection categories — e.g. "Cathedral", "Chapel", "Fingertip".
 * Stored in their own Mongo collection. Slug is the natural ID.
 */
export type Category = {
  slug: string;
  name: Localized;
};

const COLLECTION_NAME = "categories";
type CategoryDoc = Category & { _id: string };

function catCol(db: Db) {
  return db.collection<CategoryDoc>(COLLECTION_NAME);
}

/* ── Reads ─────────────────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const docs = await catCol(db).find({}).toArray();
    return docs.map((d) => {
      const { _id, ...rest } = d;
      void _id;
      return rest as Category;
    });
  } catch (e) {
    console.error("Category read failed:", e);
    return [];
  }
}

export async function getCategory(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) ?? null;
}

/* ── Writes ────────────────────────────────────────────────────── */

async function requireDb() {
  const db = await getDb();
  if (!db)
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI in .env.local.",
    );
  return db;
}

export async function createCategory(cat: Category): Promise<void> {
  const db = await requireDb();
  await catCol(db).insertOne({ _id: cat.slug, ...cat });
}

export async function deleteCategory(slug: string): Promise<void> {
  const db = await requireDb();
  await catCol(db).deleteOne({ _id: slug });
}
