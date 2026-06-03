import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "./wordmark";
import { NewsletterForm } from "./newsletter-form";
import { resolveContact } from "@/lib/contact";
import { getSiteContent } from "@/lib/site-content";

/**
 * Editorial footer. Four columns on desktop:
 *   Atelier · Collection · Visit · Newsletter
 *
 * Pulls email + Instagram from the admin-editable contact info, falling
 * back to defaults in `src/lib/contact.ts`.
 */
export async function Footer() {
  const t = await getTranslations("Footer");
  const site = await getSiteContent();
  const contact = resolveContact(site.contact);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-porcelain px-6 pt-24 pb-10 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl">
        {/* Top hairline */}
        <div className="hairline mb-16 w-full" />

        {/* Oversized wordmark */}
        <Wordmark className="mb-16 block text-[clamp(3rem,9vw,7rem)]" />

        {/* Columns */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Atelier */}
          <FooterColumn title={t("atelier.title")}>
            <FooterLink href="/about">{t("atelier.story")}</FooterLink>
            <FooterLink href="/about">{t("atelier.craft")}</FooterLink>
            <FooterLink href="/about">{t("atelier.journal")}</FooterLink>
          </FooterColumn>

          {/* Collection */}
          <FooterColumn title={t("collection.title")}>
            <FooterLink href="/collection">{t("collection.veils")}</FooterLink>
            <FooterLink href="/collection">
              {t("collection.crowns")}
            </FooterLink>
            <FooterLink href="/collection">
              {t("collection.newArrivals")}
            </FooterLink>
          </FooterColumn>

          {/* Visit */}
          <FooterColumn title={t("visit.title")}>
            <p className="text-graphite">{t("visit.address")}</p>
            <a
              className="text-graphite transition-colors hover:text-ink"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>
            <a
              className="text-graphite transition-colors hover:text-ink"
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("visit.instagram")}
            </a>
          </FooterColumn>

          {/* Newsletter */}
          <FooterColumn title={t("newsletter.title")}>
            <p className="text-graphite">{t("newsletter.blurb")}</p>
            <NewsletterForm />
          </FooterColumn>
        </div>

        {/* Bottom hairline */}
        <div className="hairline mt-16 mb-6 w-full" />

        {/* Bottom row */}
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-baseline">
          <p>{t("copyright", { year })}</p>
          <p className="small-caps">{t("credit")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="small-caps !text-ink mb-5">{title}</h3>
      <div className="flex flex-col gap-2 text-graphite">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: "/about" | "/collection" | "/contact";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-graphite transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}
