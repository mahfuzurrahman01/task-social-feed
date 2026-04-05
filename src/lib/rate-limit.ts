/**
 * In-memory sliding-window rate limiter.
 * Keyed by arbitrary string (e.g. "login:<IP>").
 * No external dependencies — works fine for a single-instance deployment.
 */

interface Window {
  timestamps: number[];
}

const store = new Map<string, Window>();

/** Remove entries older than windowMs to keep memory tidy. */
function purgeOld(key: string, windowMs: number) {
  const entry = store.get(key);
  if (!entry) return;
  const cutoff = Date.now() - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  if (entry.timestamps.length === 0) store.delete(key);
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key      Unique identifier (e.g. "login:127.0.0.1")
 * @param limit    Maximum requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  purgeOld(key, windowMs);

  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };
  entry.timestamps.push(now);
  store.set(key, entry);

  return entry.timestamps.length <= limit;
}
