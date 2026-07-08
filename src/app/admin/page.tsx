import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";
import { isMongoConfigured } from "@/lib/mongo";
import { getVeils } from "@/lib/collection";
import { BrandImage } from "@/components/brand-image";
import { AdminShell } from "./_components/admin-shell";
import { DeleteButton } from "./_components/delete-button";
import { ReorderButtons } from "./_components/reorder-buttons";

export default async function AdminDashboard() {
  await requireAdmin();
  const veils = await getVeils();
  const mongo = isMongoConfigured();

  return (
    <AdminShell
      eyebrow="Collection"
      title="Veils"
      action={
        <Link
          href="/admin/veils/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm !text-porcelain transition-colors hover:bg-gold-deep"
        >
          <span className="text-lg leading-none">+</span> New veil
        </Link>
      }
    >
      <>
        {/* Status / actions banner */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-mist bg-pearl p-5">
          <div className="text-sm text-graphite">
            <p>
              MongoDB:{" "}
              <span className={mongo ? "text-ink" : "text-gold-deep"}>
                {mongo ? "connected" : "not configured (read-only fallback)"}
              </span>
            </p>
            <p className="mt-1">
              Showing <span className="text-ink">{veils.length}</span> veils
              {mongo ? " from Mongo" : " from the hardcoded sample"}.
            </p>
            {mongo && (
              <p className="mt-1 text-muted">
                Use the arrows to reorder — the list order here is the display
                order on the collection page.
              </p>
            )}
          </div>
        </div>

        {/* List */}
        <ul className="mt-8 flex flex-col gap-3">
          {veils.map((veil, index) => (
            <li
              key={veil.slug}
              className="flex items-center gap-4 rounded-lg border border-mist bg-porcelain p-3 transition-colors hover:border-ink/20"
            >
              {/* Display order — position in the public collection grid */}
              {mongo && (
                <div className="flex shrink-0 items-center gap-3">
                  <span className="w-6 text-center text-sm tabular-nums text-muted">
                    {index + 1}
                  </span>
                  <ReorderButtons
                    slug={veil.slug}
                    isFirst={index === 0}
                    isLast={index === veils.length - 1}
                  />
                </div>
              )}

              {/* Cover thumbnail */}
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-mist">
                {veil.cover && <BrandImage image={veil.cover} sizes="56px" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-[family-name:var(--font-display)] text-xl text-ink">
                  {veil.name.en}
                  <span className="ms-3 text-sm text-muted">/ {veil.name.ar}</span>
                </p>
                <p className="mt-1 truncate text-sm text-muted">
                  <code className="text-graphite">{veil.slug}</code>
                  {veil.lineLabel.en ? ` · ${veil.lineLabel.en}` : null}
                  {veil.price?.en ? ` · ${veil.price.en}` : null}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <Link
                  href={`/admin/veils/${veil.slug}`}
                  className="rounded-md border border-ink/15 px-4 py-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold-deep"
                >
                  Edit
                </Link>
                {mongo && <DeleteButton slug={veil.slug} name={veil.name.en} />}
              </div>
            </li>
          ))}
        </ul>

        {!mongo && (
          <p className="mt-8 text-sm text-graphite">
            Set <code className="text-ink">MONGODB_URI</code> in{" "}
            <code className="text-ink">.env.local</code> to enable
            create / edit / delete.
          </p>
        )}
      </>
    </AdminShell>
  );
}
