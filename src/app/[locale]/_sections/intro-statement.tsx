import { getTranslations } from "next-intl/server";
import { RevealText } from "@/components/motion";

/**
 * Intro statement — a single editorial sentence in the display serif,
 * centered, with generous whitespace above and below. Sets the tone after
 * the hero before the user enters narrative scenes.
 */
export async function IntroStatement() {
  const t = await getTranslations("Home.intro");
  return (
    <section
      aria-label="Intro"
      className="bg-porcelain px-6 py-40 sm:px-12 sm:py-56"
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="hairline mx-auto mb-12 w-16" />
        <RevealText
          as="p"
          text={t("headline")}
          className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,3rem)] leading-[1.25] text-ink"
          staggerChildren={0.05}
        />
      </div>
    </section>
  );
}
