import { Link } from "@/i18n/navigation";
import { BrandImage } from "@/components/brand-image";
import { pickL, type Veil } from "@/lib/collection";
import type { Locale } from "@/i18n/routing";

/**
 * Quiet row of related veils used for "Complete your look" and
 * "You may also like." Up to 3 cards; if there are fewer, the grid
 * holds them at their natural width.
 */
export function RelatedRow({
  title,
  veils,
  locale,
}: {
  title: string;
  veils: Veil[];
  locale: Locale;
}) {
  if (veils.length === 0) return null;

  return (
    <section className="px-6 py-24 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] text-ink">
            {title}
          </h2>
          <div className="hairline hidden flex-1 sm:block sm:ms-8 sm:max-w-[40%]" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {veils.slice(0, 3).map((veil) => (
            <Link
              key={veil.slug}
              href={`/collection/${veil.slug}`}
              className="group block focus:outline-none"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-mist">
                {/* Cover — fades out on hover when a second image exists */}
                <div
                  className={
                    veil.gallery?.[0]
                      ? "absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-0"
                      : "absolute inset-0"
                  }
                >
                  <BrandImage
                    image={veil.cover}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                </div>
                {/* Second image — fades in on hover */}
                {veil.gallery?.[0] && (
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-100">
                    <BrandImage
                      image={veil.gallery[0]}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                    />
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-baseline justify-between">
                <h3 className="font-[family-name:var(--font-display)] text-xl text-ink">
                  {pickL(veil.name, locale)}
                </h3>
                <p className="small-caps">{pickL(veil.lineLabel, locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
