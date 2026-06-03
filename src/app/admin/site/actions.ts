"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin/session";
import { updateSiteContent, type SiteContent } from "@/lib/site-content";

export async function saveSiteContentAction(content: SiteContent) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  try {
    await updateSiteContent(content);
  } catch (e) {
    // Surface a clearer error in the admin UI than Mongo's stack trace.
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("ECONNRESET") || msg.includes("Server selection")) {
      throw new Error(
        "Couldn't reach MongoDB. Open https://cloud.mongodb.com → Network Access → Add 0.0.0.0/0 (Allow access from anywhere). Your IP changes between sessions.",
      );
    }
    throw e;
  }

  // Public pages that read site content
  revalidatePath("/[locale]", "layout");
  revalidatePath("/[locale]/about", "page");
  revalidatePath("/[locale]/contact", "page");
  revalidatePath("/admin/site", "page");

  return { ok: true as const };
}
