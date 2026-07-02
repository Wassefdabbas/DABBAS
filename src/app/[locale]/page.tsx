import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSiteContent } from "@/lib/site-content";
import { Hero } from "./_sections/hero";
import { IntroStatement } from "./_sections/intro-statement";
import { CollectionSection } from "./_sections/collection-section";
import { OurCraft } from "./_sections/our-craft";
import { FeaturedVeils } from "./_sections/featured-veils";
import { Heritage } from "./_sections/heritage";
import { AtelierStats } from "./_sections/atelier-stats";
import { AppointmentCTA } from "./_sections/appointment-cta";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const site = await getSiteContent();

  // Narrative arc: image (hero) → one sentence of intent (intro) → browse
  // (collection) → how it's made (craft, pinned) → the pieces (featured) →
  // who we are (heritage, pinned) → proof (stats) → the single ask (cta).
  // The featured grid separates the two pinned scenes so the page breathes
  // between camera moves.
  return (
    <main>
      <Hero media={site.hero} />
      <IntroStatement />
      <CollectionSection />
      <OurCraft media={site.craft} />
      <FeaturedVeils />
      <Heritage media={site.heritage} />
      <AtelierStats />
      <AppointmentCTA />
    </main>
  );
}
