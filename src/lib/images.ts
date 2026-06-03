/**
 * Three-source image model. Every brand image is one of:
 *   - Drive    — paste a Drive share URL, we extract the file ID
 *   - URL      — paste any direct image URL (Pinterest pin image, etc.)
 *   - Cloudinary — production CDN with f_auto / q_auto
 *
 * `<BrandImage>` consumes the union and routes to the right loader.
 */

export type BrandImageSource =
  | { kind: "drive"; id: string }
  | { kind: "cloudinary"; publicId: string }
  | { kind: "url"; url: string };

export type BrandImage = {
  src: BrandImageSource;
  alt: string;
  /** Optional. Defaults to 4/5 (portrait) — most veil photography is vertical. */
  aspect?: string;
};

/* -------------------------------------------------------------------------- */
/* URL builders                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Cloudinary cloud name. Read at module-eval; if missing, Cloudinary-sourced
 * images render a visible placeholder instead of a broken URL.
 *
 * Set in `.env.local`:
 *   CLOUDINARY_CLOUD_NAME=your-cloud
 *
 * Made available on both server and client via next.config.ts `env` block.
 */
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? "";

/**
 * Sentinel: a "placeholder" Cloudinary source is one whose publicId starts
 * with `placeholder-` — produced by `paintedRef()` in the sample veil data.
 * These don't exist on Cloudinary; they signal "render the painted fallback".
 */
const PLACEHOLDER_PREFIX = "placeholder-";
function isPlaceholderId(publicId: string): boolean {
  return publicId.startsWith(PLACEHOLDER_PREFIX);
}

const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export function buildSrc(source: BrandImageSource, width = 1600): string {
  if (source.kind === "drive") {
    return `https://drive.google.com/thumbnail?id=${source.id}&sz=w${width}`;
  }

  if (source.kind === "url") {
    return source.url;
  }

  // Cloudinary
  if (!CLOUDINARY_CLOUD || isPlaceholderId(source.publicId)) {
    // Either no cloud configured or this is a sentinel placeholder.
    // <BrandImage> renders a painted gradient on top.
    return TRANSPARENT_GIF;
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,w_${width}/${source.publicId}`;
}

/** Whether this source can render right now. */
export function isSrcReady(source: BrandImageSource): boolean {
  if (source.kind === "drive") return true;
  if (source.kind === "url") return true;
  // Cloudinary: ready only if cloud is set AND it's not a sentinel placeholder
  if (isPlaceholderId(source.publicId)) return false;
  return CLOUDINARY_CLOUD.length > 0;
}

/** Drive + URL + placeholders skip Next's optimizer. */
export function isUnoptimized(source: BrandImageSource): boolean {
  if (source.kind !== "cloudinary") return true;
  return isPlaceholderId(source.publicId);
}

/* -------------------------------------------------------------------------- */
/* Helpers for authoring                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Extracts a Drive file ID from any of the common share-URL shapes.
 * Returns null if none matched.
 *
 *   https://drive.google.com/file/d/{ID}/view?usp=sharing
 *   https://drive.google.com/open?id={ID}
 *   https://drive.google.com/uc?id={ID}&export=download
 *   https://drive.google.com/drive/folders/...  → null (folder, not file)
 *   just-the-id-string                          → returned as-is
 */
export function parseDriveId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare ID — Drive IDs are typically 25+ url-safe chars
  if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) return trimmed;

  const patterns = [
    /\/file\/d\/([A-Za-z0-9_-]{20,})/,
    /[?&]id=([A-Za-z0-9_-]{20,})/,
    /\/d\/([A-Za-z0-9_-]{20,})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Video URLs                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Build a streaming video URL for one of the two supported providers.
 *
 * - Drive: `uc?export=download` serves the raw file. Works fine for small
 *   videos. For files larger than ~100MB, Drive returns an HTML virus-scan
 *   interstitial that breaks <video>. For hero videos prefer Cloudinary.
 * - Cloudinary: standard video-upload URL with `q_auto` for adaptive
 *   compression. Returns an .mp4 by default — good cross-browser support.
 */
export function videoUrl(provider: "drive" | "cloudinary", id: string): string {
  if (provider === "drive") {
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_auto/${id}.mp4`;
}

/** Whether a video can render right now (Cloudinary needs the cloud env). */
export function isVideoReady(provider: "drive" | "cloudinary"): boolean {
  if (provider === "drive") return true;
  return CLOUDINARY_CLOUD.length > 0;
}

/** Author helper: build a Drive-sourced BrandImage from a share URL. */
export function driveImage(urlOrId: string, alt: string, aspect?: string): BrandImage {
  const id = parseDriveId(urlOrId);
  if (!id) {
    throw new Error(`Not a recognizable Drive URL/ID: ${urlOrId}`);
  }
  return { src: { kind: "drive", id }, alt, aspect };
}

/** Author helper: build a Cloudinary-sourced BrandImage from a publicId. */
export function cloudinaryImage(
  publicId: string,
  alt: string,
  aspect?: string,
): BrandImage {
  return { src: { kind: "cloudinary", publicId }, alt, aspect };
}

/** Author helper: build a URL-sourced BrandImage (e.g. Pinterest image). */
export function urlImage(url: string, alt: string, aspect?: string): BrandImage {
  return { src: { kind: "url", url }, alt, aspect };
}

/** Best-effort: does this look like an HTTP(S) URL? */
export function looksLikeUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Is this URL a Pinterest pin page (not a direct image)? */
export function isPinterestPinUrl(s: string): boolean {
  return /^https?:\/\/((www|[a-z]{2})\.)?pinterest\.[a-z.]+\/pin\//.test(
    s.trim(),
  );
}
