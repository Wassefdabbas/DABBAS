import { BrandImage } from "./brand-image";
import {
  buildSrc,
  videoUrl,
  isVideoReady,
  type BrandImage as BrandImageData,
} from "@/lib/images";
import type { Media } from "@/lib/site-content";
import { cn } from "@/lib/cn";

/**
 * <BrandMedia> — renders a hero/section slot. Hands off to <BrandImage> for
 * stills, or a quietly auto-playing <video> for video slots.
 *
 * If `media` is null or the video can't render (e.g. Cloudinary not configured
 * yet), shows the `fallback` instead — usually a painted placeholder so the
 * layout never has a hole.
 */
export function BrandMedia({
  media,
  className,
  sizes = "100vw",
  priority = false,
  fallback,
}: {
  media: Media;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallback?: React.ReactNode;
}) {
  if (!media) return <>{fallback}</>;

  if (media.kind === "image") {
    return (
      <BrandImage
        image={media.image}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  // Video — must render <video>, but if its provider isn't configured we
  // still want the poster (or fallback) on screen.
  if (!isVideoReady(media.source.provider)) {
    if (media.poster) {
      return (
        <BrandImage
          image={media.poster}
          className={className}
          sizes={sizes}
          priority={priority}
        />
      );
    }
    return <>{fallback}</>;
  }

  const src = videoUrl(media.source.provider, media.source.id);
  const poster = media.poster ? buildSrc(media.poster.src, 1600) : undefined;

  return (
    <video
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={media.alt}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

/** Convenience type re-export — used by section props. */
export type { BrandImageData };
