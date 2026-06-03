import { cn } from "@/lib/cn";

/**
 * A CSS-painted "image" tile used in motion demos so the styleguide does not
 * need remote images configured. Three variants pull from the brand palette.
 */
type Variant = "dawn" | "atelier" | "veil";

const variants: Record<Variant, string> = {
  dawn: "radial-gradient(at 30% 25%, var(--porcelain), var(--gold-soft) 60%, var(--gold-deep) 115%)",
  atelier:
    "linear-gradient(160deg, var(--mist) 0%, var(--porcelain) 45%, var(--gold-soft) 100%)",
  veil:
    "linear-gradient(180deg, var(--porcelain) 0%, var(--mist) 60%, var(--graphite) 130%)",
};

export function PaintedTile({
  variant = "dawn",
  className,
  label,
}: {
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("relative h-full w-full", className)}
      style={{ background: variants[variant] }}
    >
      {label && (
        <span className="small-caps absolute bottom-4 start-4 text-porcelain/85">
          {label}
        </span>
      )}
    </div>
  );
}
