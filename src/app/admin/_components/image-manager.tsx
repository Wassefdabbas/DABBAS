"use client";

import { BrandImage } from "@/components/brand-image";
import type { BrandImage as BrandImageData } from "@/lib/images";
import { ImageInput } from "./image-input";
import { cn } from "@/lib/cn";

/**
 * Ordered image manager. One list of images where position 0 is ALWAYS the
 * cover (badged) and the rest are the gallery — no separate cover upload.
 * Add as many as you like, reorder with the arrows, edit alt text per image.
 *
 * The parent stores cover + gallery separately (the data model), so it passes
 * the flattened `images` array in and gets the reordered array back; mapping
 * back to cover/gallery is `images[0]` + `images.slice(1)`.
 */
export function ImageManager({
  images,
  onChange,
}: {
  images: BrandImageData[];
  onChange: (next: BrandImageData[]) => void;
}) {
  const update = (i: number, img: BrandImageData) =>
    onChange(images.map((g, idx) => (idx === i ? img : g)));
  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <ul className="flex flex-col gap-3">
          {images.map((img, i) => {
            const isCover = i === 0;
            return (
              <li
                key={i}
                className={cn(
                  "flex gap-4 rounded-lg border bg-pearl p-3",
                  isCover ? "border-gold/50" : "border-mist",
                )}
              >
                {/* Thumbnail */}
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-mist">
                  <BrandImage image={img} sizes="96px" />
                  {isCover && (
                    <span className="absolute inset-x-0 top-0 bg-gold-deep/90 py-0.5 text-center text-[0.625rem] font-medium uppercase tracking-wider text-porcelain">
                      Cover
                    </span>
                  )}
                </div>

                {/* Body: position + alt + actions */}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted">
                      {isCover ? "Position 1 · shown everywhere as the cover" : `Position ${i + 1}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label="Move up"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </IconButton>
                      <IconButton
                        label="Move down"
                        disabled={i === images.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </IconButton>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => update(i, { ...img, alt: e.target.value })}
                    placeholder="Alt text — describe the image"
                    className="w-full rounded-md border border-ink/15 bg-porcelain px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
                  />

                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="self-start text-xs text-gold-deep transition-colors hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add image(s) — multiple selection appends in order */}
      <ImageInput
        label={
          images.length === 0
            ? "Add images (the first becomes the cover)"
            : "Add more images"
        }
        value={null}
        onChange={(img) => onChange([...images, img])}
        onAddMany={(imgs) => onChange([...images, ...imgs])}
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-ink/15 text-ink transition-colors hover:border-gold hover:text-gold-deep disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:text-ink"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        {children}
      </svg>
    </button>
  );
}
