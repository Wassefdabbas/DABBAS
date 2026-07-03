import { requireAdmin } from "@/lib/admin/guard";
import { getSiteContent } from "@/lib/site-content";
import { getVeils, pickL } from "@/lib/collection";
import { AdminShell } from "../_components/admin-shell";
import { SiteForm } from "./site-form";

export default async function SiteContentPage() {
  await requireAdmin();
  const [initial, veils] = await Promise.all([getSiteContent(), getVeils()]);
  const veilOptions = veils.map((v) => ({
    slug: v.slug,
    name: pickL(v.name, "en"),
  }));

  return (
    <AdminShell
      width="narrow"
      title="Site content"
      eyebrow="Public site"
    >
      <p className="-mt-4 mb-8 text-sm text-graphite">
        Editable media slots on the public site. Empty slots fall back to
        painted placeholders so the layout never has a hole.
      </p>

      <SiteForm initial={initial} veilOptions={veilOptions} />
    </AdminShell>
  );
}
