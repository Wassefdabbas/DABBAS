/**
 * Minimal admin session.
 *
 * - One hardcoded admin. Password comes from the `ADMIN_PASSWORD` env var.
 * - Session is a signed cookie: `<expiresAt>.<hmacSHA256(secret, expiresAt)>`.
 *   No DB, no JWT lib. ~30 lines.
 * - `SESSION_SECRET` env var signs the cookie. Rotate to force every admin
 *   to log in again.
 *
 * Cookies set httpOnly + sameSite=lax + secure-in-prod. Default lifetime
 * 7 days; bump via SESSION_TTL_HOURS if needed.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "dabbas_admin";
const SECRET = process.env.SESSION_SECRET ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? "168"); // 7 days

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

/** Constant-time string compare; returns false on length mismatch. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/* ─── Login / Logout ─────────────────────────────────────────── */

export type LoginResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "bad_password" };

export async function login(password: string): Promise<LoginResult> {
  if (!SECRET || !ADMIN_PASSWORD) return { ok: false, reason: "not_configured" };
  if (!safeEqual(password, ADMIN_PASSWORD)) return { ok: false, reason: "bad_password" };

  const expiresAt = String(Date.now() + TTL_HOURS * 3600_000);
  const value = `${expiresAt}.${sign(expiresAt)}`;

  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_HOURS * 3600,
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/* ─── Verification ───────────────────────────────────────────── */

/** True if the current request has a valid, non-expired admin cookie. */
export async function isAdmin(): Promise<boolean> {
  if (!SECRET) return false;
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [expiresAt, mac] = raw.split(".");
  if (!expiresAt || !mac) return false;
  if (!safeEqual(mac, sign(expiresAt))) return false;
  if (Number(expiresAt) < Date.now()) return false;
  return true;
}

/** Returns whether the server has the env vars needed to log anyone in. */
export function isConfigured(): boolean {
  return Boolean(SECRET && ADMIN_PASSWORD);
}
