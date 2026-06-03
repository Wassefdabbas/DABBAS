import { getTranslations } from "next-intl/server";
import { Stagger } from "@/components/motion";
import { CollectionCard, type CollectionCardData } from "./collection-card";
import { CollectionCarousel } from "./collection-carousel";

type CardKey = "signature" | "romance" | "cathedral" | "bespoke";

const CARDS: Array<{ key: CardKey; name: string; slug: string }> = [
  { key: "signature", name: "SIGNATURE", slug: "signature" },
  { key: "romance", name: "ROMANCE", slug: "romance" },
  { key: "cathedral", name: "CATHEDRAL", slug: "cathedral" },
  { key: "bespoke", name: "BESPOKE", slug: "bespoke" },
];

/**
 * "The Collection" — four editorial cards directly below the hero.
 * Desktop: a flush 2×2 magazine grid. Mobile: a peeking Embla carousel.
 * Strings resolved server-side so the section stays statically rendered.
 */
export async function CollectionSection() {
  const t = await getTranslations("Home.collection");

  const cards: CollectionCardData[] = CARDS.map((c) => ({
    slug: c.slug,
    name: c.name,
    descriptor: t(`cards.${c.key}`),
    src: `/collection/${c.slug}.png`,
  }));

  // Desktop sizes: each card ~48vw. Carousel passes its own.
  const gridSizes = "(min-width: 768px) 48vw, 85vw";

  return (
    <section aria-label="The Collection" className="bg-porcelain pb-16 pt-12 sm:pb-20 sm:pt-16">
      {/* Header — display-serif title, matching the Featured Veils style */}
      <div className="mb-14 px-6 text-center sm:mb-20 sm:px-12 lg:px-24">
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,5.5rem)] leading-[1.02] text-ink">
          {t("eyebrow")}
        </h2>
      </div>

      {/* Desktop: 2×2 grid with staggered reveal */}
      <Stagger
        className="hidden grid-cols-2 gap-6 px-6 sm:gap-8 sm:px-12 md:grid lg:px-24"
        staggerChildren={0.12}
      >
        {cards.map((card) => (
          <CollectionCard key={card.slug} card={card} sizes={gridSizes} />
        ))}
      </Stagger>

      {/* Mobile: peeking carousel */}
      <CollectionCarousel cards={cards} />
    </section>
  );
}
