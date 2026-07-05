import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MagneticButton } from "@/components/motion";

/**
 * Final band — the only conversion goal of the site. Hairlines bracket a
 * single centered headline, subhead, and magnetic CTA.
 */
export async function AppointmentCTA() {
  const t = await getTranslations("Home.cta");

  return (
    <section
      aria-label="Book an appointment"
      className="bg-porcelain px-6 pt-20 pb-40 sm:px-12 sm:pt-24 sm:pb-56"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="hairline mx-auto mb-16 w-24" />

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] text-ink">
          {t("headline")}
        </h2>
        <p className="mt-6 text-lg text-graphite">{t("subhead")}</p>

        <div className="mt-12 flex justify-center">
          <Link href="/contact" className="focus:outline-none">
            <MagneticButton
              type="button"
              className="bg-ink px-10 py-5 text-porcelain transition-colors duration-300 ease-[var(--ease-out-expo)] hover:bg-gold-deep"
              strength={0.35}
              labelStrength={0.3}
            >
              <span className="small-caps !text-current">{t("button")}</span>
              <span aria-hidden className="rtl:rotate-180">
                &rarr;
              </span>
            </MagneticButton>
          </Link>
        </div>

        <div className="hairline mx-auto mt-16 w-24" />
      </div>
    </section>
  );
}
