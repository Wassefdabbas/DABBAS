import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { isMongoConfigured } from "@/lib/mongo";
import { getVeils } from "@/lib/collection";
import { getCategories } from "@/lib/categories";
import { AdminShell } from "../../_components/admin-shell";
import { VeilForm } from "../../_components/veil-form";

export default async function NewVeilPage() {
  await requireAdmin();
  const [all, categories] = await Promise.all([getVeils(), getCategories()]);
  const mongo = isMongoConfigured();

  return (
    <AdminShell
      width="narrow"
      eyebrow={
        <Link href="/admin" className="text-muted transition-colors hover:text-ink">
          ← Veils
        </Link>
      }
      title="New veil"
    >
      {!mongo && (
        <p className="mb-6 rounded-lg border border-mist bg-pearl p-4 text-sm text-graphite">
          MongoDB is not configured. Set{" "}
          <code className="text-ink">MONGODB_URI</code> in{" "}
          <code className="text-ink">.env.local</code> before saving — the form
          will load but the save will fail with a clear error.
        </p>
      )}

      <VeilForm
        otherSlugs={all.map((v) => ({ slug: v.slug, name: v.name.en }))}
        categories={categories}
      />
    </AdminShell>
  );
}
