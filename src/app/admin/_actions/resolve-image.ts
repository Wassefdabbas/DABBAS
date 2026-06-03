"use server";

import { isAdmin } from "@/lib/admin/session";
import { isPinterestPinUrl, looksLikeUrl } from "@/lib/images";

/**
 * Pasted-URL resolver — used by ImageInput.
 *
 * - Pinterest pin pages (https://www.pinterest.com/pin/123/) — fetch the
 *   page, extract `<meta property="og:image">` (which Pinterest sets to the
 *   full-res image at i.pinimg.com).
 * - Anything else — return the URL as-is (the caller stores it as a
 *   `{ kind: "url" }` BrandImage).
 *
 * Runs server-side so we sidestep CORS. Admin-gated; not for public callers.
 */
export async function resolveImageUrlAction(
  input: string,
): Promise<{ ok: true; url: string } | { ok: false; reason: string }> {
  if (!(await isAdmin())) return { ok: false, reason: "Unauthorized." };

  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: "Empty URL." };
  if (!looksLikeUrl(trimmed))
    return { ok: false, reason: "Not a URL." };

  if (!isPinterestPinUrl(trimmed)) {
    // Already a direct URL (or some other host) — accept as-is.
    return { ok: true, url: trimmed };
  }

  try {
    const res = await fetch(trimmed, {
      // Pinterest serves a real HTML page only to "browser" user-agents.
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, reason: `Pinterest returned ${res.status}.` };
    const html = await res.text();
    // Look for og:image (Pinterest's canonical full-res image)
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!m) return { ok: false, reason: "Couldn't find image on that pin page." };
    return { ok: true, url: m[1] };
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "Pinterest fetch failed.",
    };
  }
}
