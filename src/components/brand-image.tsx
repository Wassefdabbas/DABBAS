import Image, { type ImageProps } from "next/image";
import {
  buildSrc,
  isSrcReady,
  isUnoptimized,
  type BrandImage as BrandImageData,
} from "@/lib/images";
import { cn } from "@/lib/cn";

type Props = {
  image: BrandImageData;
  /**
   * Hint for next/image's responsive sizing (Cloudinary uses it; Drive
   * ignores it but the hint is still useful for the browser's load order).
   */
  sizes?: string;
  /** When the image is the LCP element. */
  priority?: boolean;
  /** Width hint for the URL builder. Drive uses this directly; Cloudinary scales. */
  widthHint?: number;
  className?: string;
  /** Wrapper class — controls aspect ratio / positioning. */
  wrapperClassName?: string;
} & Omit<ImageProps, "src" | "alt" | "sizes" | "priority" | "width" | "height" | "className">;

/**
 * One image component, two sources.
 *
 * - Drive: rendered via the `thumbnail` endpoint, passed to <Image unoptimized>
 *   so Next doesn't try to re-proxy through `/_next/image` (Drive doesn't
 *   honor those params).
 * - Cloudinary: rendered through Next's loader with `f_auto,q_auto`.
 *
 * If the Cloudinary cloud name isn't configured (Phase 4 stub), the wrapper
 * shows a painted gradient placeholder instead of a broken image. This keeps
 * the layout intact while we wait on credentials.
 */
export function BrandImage({
  image,
  sizes = "100vw",
  priority = false,
  widthHint = 1600,
  className,
  wrapperClassName,
  ...rest
}: Props) {
  const ready = isSrcReady(image.src);
  const src = buildSrc(image.src, widthHint);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        wrapperClassName,
      )}
      style={image.aspect ? { aspectRatio: image.aspect } : undefined}
    >
      {!ready && (
        // Painted fallback so the layout never shows a broken-image icon.
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(at 30% 25%, var(--porcelain), var(--gold-soft) 60%, var(--gold-deep) 115%)",
          }}
        />
      )}
      <Image
        src={src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={isUnoptimized(image.src)}
        className={cn("object-cover", className)}
        {...rest}
      />
    </div>
  );
}
