import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/guard";
import { getVeil, getVeils } from "@/lib/collection";
import { getCategories } from "@/lib/categories";
import { AdminShell } from "../../_components/admin-shell";
import { VeilForm } from "../../_components/veil-form";

export default async function EditVeilPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const veil = await getVeil(slug);
  if (!veil) notFound();

  const [all, categories] = await Promise.all([getVeils(), getCategories()]);
  const otherSlugs = all
    .filter((v) => v.slug !== slug)
    .map((v) => ({ slug: v.slug, name: v.name.en }));

  return (
    <AdminShell
      width="narrow"
      eyebrow={
        <Link href="/admin" className="text-muted transition-colors hover:text-ink">
          ← Veils
        </Link>
      }
      title={`Edit ${veil.name.en}`}
    >
      <VeilForm
        initial={veil}
        originalSlug={slug}
        otherSlugs={otherSlugs}
        categories={categories}
      />
    </AdminShell>
  );
}
