/**
 * MongoDB connection singleton.
 *
 * - `MONGODB_URI` (server-side env). When unset, `getDb()` returns null and
 *   callers fall back to the hardcoded sample data — this means the site
 *   keeps working in environments without a database (Phase 5 behavior).
 * - `MONGODB_DB` selects the database name. Defaults to `dabbas-atelier`.
 *
 * In dev (HMR) we cache the client on `globalThis` so we don't open a new
 * connection on every file change. In prod the module is loaded once per
 * server instance.
 */

import { MongoClient, type Db } from "mongodb";

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB ?? "dabbas-atelier";

type Cached = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as unknown as { __dabbasMongo?: Cached };
const cache: Cached =
  globalForMongo.__dabbasMongo ?? (globalForMongo.__dabbasMongo = { client: null, promise: null });

async function getClient(): Promise<MongoClient | null> {
  if (!URI) return null;
  if (cache.client) return cache.client;
  if (!cache.promise) {
    cache.promise = MongoClient.connect(URI, {
      // Fail fast instead of hanging the page render forever
      serverSelectionTimeoutMS: 8000,
      // Don't sit idle waiting on broken sockets either
      socketTimeoutMS: 20000,
      // Atlas SRV defaults TLS on; explicit for clarity
      tls: true,
      // Shows in Atlas logs — easier debugging
      appName: "dabbas-atelier",
      // Recommended Atlas defaults (also expressible in the URI)
      retryWrites: true,
    })
      .then((c) => {
        cache.client = c;
        return c;
      })
      .catch((e) => {
        // Reset the cached promise so the next request retries cleanly
        cache.promise = null;
        throw e;
      });
  }
  return cache.promise;
}

export async function getDb(): Promise<Db | null> {
  const client = await getClient();
  return client ? client.db(DB_NAME) : null;
}

/** True only when MONGODB_URI is set. */
export function isMongoConfigured(): boolean {
  return Boolean(URI);
}

/**
 * Reachability ping — actually tries to connect and run a no-op command.
 * Use sparingly (each call is a real network round-trip). Used by the
 * admin to show a green/red status before the user wastes time.
 */
export async function pingMongo(): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!URI) return { ok: false, reason: "MONGODB_URI not set in .env.local" };
  try {
    const client = await getClient();
    if (!client) return { ok: false, reason: "MongoDB client unavailable" };
    await client.db().command({ ping: 1 });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: msg };
  }
}
