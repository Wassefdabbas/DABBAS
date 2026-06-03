import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * The brand wordmark. Always renders in the display serif at a controlled
 * size — used in the header center, mobile nav, and footer.
 */
export function Wordmark({
  className,
  href = "/",
  ariaLabel = "DABBAS Atelier — home",
}: {
  className?: string;
  href?: "/" | "/about" | "/collection" | "/contact";
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "inline-block font-[family-name:var(--font-display)] text-ink",
        "leading-none tracking-[0.18em]",
        className,
      )}
    >
      DABBAS
    </Link>
  );
}
