"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/session";
import {
  createCategory,
  deleteCategory,
  type Category,
} from "@/lib/categories";

async function gate() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

function revalidateAll() {
  revalidatePath("/admin/categories", "page");
  revalidatePath("/admin/veils/new", "page");
  revalidatePath("/admin/veils/[slug]", "page");
  revalidatePath("/[locale]/collection", "page");
}

export async function createCategoryAction(category: Category) {
  await gate();
  if (!/^[a-z0-9-]+$/.test(category.slug)) {
    throw new Error("Slug must be lowercase letters, digits, and hyphens.");
  }
  if (!category.name.en) throw new Error("Name (EN) is required.");
  await createCategory(category);
  revalidateAll();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(slug: string) {
  await gate();
  await deleteCategory(slug);
  revalidateAll();
}
