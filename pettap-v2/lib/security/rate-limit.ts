import "server-only";

type RateLimitEntry = { count: number; resetAt: number };
export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

const entries = new Map<string, RateLimitEntry>();
const MAX_ENTRIES = 10_000;

/**
 * Deliberately small process-local protection for unauthenticated endpoints.
 * Production can replace this implementation with a shared edge/KV adapter
 * without changing callers. It never stores request bodies or account data.
 */
export function checkRateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }): RateLimitResult {
  const now = Date.now();
  const current = entries.get(key);
  if (entries.size >= MAX_ENTRIES) {
    for (const [candidate, value] of entries) {
      if (value.resetAt <= now) entries.delete(candidate);
    }
  }
  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }
  if (current.count >= limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export function clientRequestKey(headers: Headers, namespace: string) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip")?.trim() || "unknown";
  return `${namespace}:${ip.slice(0, 128)}`;
}

export function clearRateLimitStateForTests() {
  if (process.env.NODE_ENV === "test") entries.clear();
}
