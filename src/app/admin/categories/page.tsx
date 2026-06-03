import { requireAdmin } from "@/lib/admin/guard";
import { isMongoConfigured } from "@/lib/mongo";
import { getCategories } from "@/lib/categories";
import { AdminShell } from "../_components/admin-shell";
import { CategoryRowActions } from "./row-actions";
import { CategoryNewForm } from "./new-form";

export default async function CategoriesPage() {
  await requireAdmin();
  const cats = await getCategories();
  const mongo = isMongoConfigured();

  return (
    <AdminShell
      title="Categories"
      eyebrow="Collection"
    >
      <p className="-mt-4 mb-8 text-sm text-graphite">
        Used on the collection grid and as a filter on each veil.
      </p>

      {!mongo && (
        <p className="mb-6 rounded-lg border border-mist bg-pearl p-4 text-sm text-graphite">
          MongoDB is not configured. Set{" "}
          <code className="text-ink">MONGODB_URI</code> in{" "}
          <code className="text-ink">.env.local</code> before adding.
        </p>
      )}

      {/* New */}
      <section className="mb-10 rounded-xl border border-mist bg-porcelain p-5 sm:p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-ink">
          New category
        </h2>
        <CategoryNewForm />
      </section>

      {/* List */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-ink">
          {cats.length === 0 ? "No categories yet" : `${cats.length} total`}
        </h2>
        {cats.length > 0 && (
          <ul className="flex flex-col gap-3">
            {cats.map((c) => (
              <li
                key={c.slug}
                className="flex items-center justify-between gap-6 rounded-lg border border-mist bg-porcelain p-4"
              >
                <div>
                  <p className="text-lg text-ink">
                    {c.name.en}
                    {c.name.ar && (
                      <span className="ms-3 text-sm text-muted">/ {c.name.ar}</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    <code>{c.slug}</code>
                  </p>
                </div>
                <CategoryRowActions slug={c.slug} name={c.name.en} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
