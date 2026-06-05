import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RevealText } from "@/components/motion";
import { resolveContact, emailUrl, whatsappUrl } from "@/lib/contact";
import { getSiteContent } from "@/lib/site-content";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return {
    title: `${t("headline")} — DABBAS`,
    description: t("lead"),
  };
}

/* ── Inline icons (no emoji per brand) ───────────────────────── */

function WhatsAppIcon({ className }: { className?: string }) {
  // Quiet speech-bubble glyph in currentColor. Stroke-only for editorial feel.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-12.38 7.33L3 21l2.17-5.62A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  const site = await getSiteContent();
  const contact = resolveContact(site.contact);
  const waHref = whatsappUrl(t("whatsapp.prefilledMessage"), contact.whatsapp.number);
  const mailHref = emailUrl({
    subject: t("email.prefilledSubject"),
    email: contact.email,
  });

  return (
    <main className="bg-porcelain">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="px-6 pt-40 pb-20 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="small-caps mb-6">{t("eyebrow")}</p>
          <RevealText
            as="h1"
            text={t("headline")}
            className="font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,6rem)] leading-[0.95] text-ink"
          />
          <RevealText
            as="p"
            text={t("lead")}
            className="mt-10 max-w-xl text-lg leading-relaxed text-graphite"
            staggerChildren={0.04}
          />
          <div className="hairline mt-16 w-24" />
        </div>
      </header>

      {/* ── Action cards ─────────────────────────────────────── */}
      <section className="px-6 pb-32 sm:px-12 lg:px-24">
        <div className="mx-auto grid max-w-5xl gap-px bg-mist sm:grid-cols-2">
          {/* WhatsApp */}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("whatsapp.label")} — ${t("whatsapp.cta")}`}
            className="group flex flex-col gap-8 bg-porcelain p-10 transition-colors duration-500 hover:bg-pearl sm:p-14"
          >
            <WhatsAppIcon className="h-8 w-8 text-gold-deep transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110" />
            <div>
              <p className="small-caps">{t("whatsapp.label")}</p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.15] text-ink">
                {contact.whatsapp.display}
              </p>
              <p className="mt-3 text-graphite">{t("whatsapp.blurb")}</p>
            </div>
            <div className="mt-auto inline-flex items-center gap-3 border-b border-gold pb-1 text-ink transition-colors group-hover:text-gold-deep self-start">
              <span className="small-caps !text-current">
                {t("whatsapp.cta")}
              </span>
              <span aria-hidden className="rtl:rotate-180">
                &rarr;
              </span>
            </div>
          </a>

          {/* Email */}
          <a
            href={mailHref}
            aria-label={`${t("email.label")} — ${t("email.cta")}`}
            className="group flex flex-col gap-8 bg-porcelain p-10 transition-colors duration-500 hover:bg-pearl sm:p-14"
          >
            <EnvelopeIcon className="h-8 w-8 text-gold-deep transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110" />
            <div>
              <p className="small-caps">{t("email.label")}</p>
              <p className="mt-4 break-all font-[family-name:var(--font-display)] text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] text-ink">
                {contact.email}
              </p>
              <p className="mt-3 text-graphite">{t("email.blurb")}</p>
            </div>
            <div className="mt-auto inline-flex items-center gap-3 border-b border-gold pb-1 text-ink transition-colors group-hover:text-gold-deep self-start">
              <span className="small-caps !text-current">
                {t("email.cta")}
              </span>
              <span aria-hidden className="rtl:rotate-180">
                &rarr;
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* ── Visit info ───────────────────────────────────────── */}
      <section className="bg-pearl px-6 py-24 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-5xl">
          <p className="small-caps mb-10">{t("visit.label")}</p>
          <div className="grid gap-12 sm:grid-cols-3">
            <div>
              <p className="small-caps mb-3 !text-muted">
                {t("visit.addressLabel")}
              </p>
              <p className="text-graphite">{contact.address[locale]}</p>
            </div>
            <div>
              <p className="small-caps mb-3 !text-muted">
                {t("visit.hoursLabel")}
              </p>
              <p className="text-graphite">{t("visit.hours")}</p>
            </div>
            <div>
              <p className="small-caps mb-3 !text-muted">
                {t("visit.instagramLabel")}
              </p>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-gold pb-px text-graphite transition-colors hover:text-ink"
              >
                @dabbas.atelier
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
