import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getSiteContent } from "@/lib/site-content";
import { Hero } from "./_sections/hero";
import { CollectionSection } from "./_sections/collection-section";
import { OurCraft } from "./_sections/our-craft";
import { FeaturedVeils } from "./_sections/featured-veils";
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

  return (
    <main>
      <Hero media={site.hero} />
      <CollectionSection />
      <OurCraft media={site.craft} />
      <FeaturedVeils />
      <AtelierStats />
      <AppointmentCTA />
    </main>
  );
}
