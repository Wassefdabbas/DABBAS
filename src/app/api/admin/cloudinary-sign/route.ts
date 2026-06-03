import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdmin } from "@/lib/admin/session";

/**
 * Cloudinary signed-upload helper.
 *
 * The browser-side upload widget calls this endpoint with the params it
 * wants signed. We compute SHA1(sorted_params + api_secret) on the server
 * (api_secret stays out of the bundle) and return the signature.
 *
 * Required env:
 *   CLOUDINARY_CLOUD_NAME   (exposed to client via next.config.ts env block)
 *   CLOUDINARY_API_KEY      (exposed to client via next.config.ts env block)
 *   CLOUDINARY_API_SECRET   (server-only)
 *
 * Admin-gated — same session cookie the rest of /admin uses.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json(
      { error: "CLOUDINARY_API_SECRET not configured on the server." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const params = (body as { paramsToSign?: Record<string, string | number> })
    ?.paramsToSign;
  if (!params || typeof params !== "object") {
    return NextResponse.json(
      { error: "Missing paramsToSign" },
      { status: 400 },
    );
  }

  // Cloudinary signature spec:
  //   sort params alphabetically, join key=value with &, append api_secret,
  //   SHA1 the result, lowercase hex.
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys
    .map((k) => `${k}=${String(params[k])}`)
    .join("&");
  const signature = createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  return NextResponse.json({ signature });
}
