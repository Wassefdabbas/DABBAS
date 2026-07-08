"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/session";
import {
  createVeil,
  updateVeil,
  deleteVeil,
  moveVeil,
  type Veil,
} from "@/lib/collection";

/* ── Helpers ─────────────────────────────────────────────────── */

async function gate() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
}

/**
 * Revalidate all paths that read veil data. Called after any write.
 * The collection routes are statically generated per slug, so we hit
 * both the index and the slug pattern.
 */
function revalidateAll() {
  revalidatePath("/[locale]", "layout"); // homepage's featured carousel
  revalidatePath("/[locale]/collection", "page");
  revalidatePath("/[locale]/collection/[slug]", "page");
  revalidatePath("/admin", "page");
}

/* ── Create / Update / Delete ────────────────────────────────── */

export type VeilFormPayload = Veil; // form serializes to this shape

export async function createVeilAction(payload: VeilFormPayload) {
  await gate();
  await createVeil(payload);
  revalidateAll();
  redirect("/admin");
}

export async function updateVeilAction(
  originalSlug: string,
  payload: VeilFormPayload,
) {
  await gate();
  await updateVeil(originalSlug, payload);
  revalidateAll();
  redirect("/admin");
}

export async function deleteVeilAction(slug: string) {
  await gate();
  await deleteVeil(slug);
  revalidateAll();
}

/** Move a veil one step up/down in the collection display order. */
export async function moveVeilAction(slug: string, direction: "up" | "down") {
  await gate();
  await moveVeil(slug, direction);
  revalidateAll();
}
