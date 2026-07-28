import "server-only";

import { checkRateLimit } from "@/lib/security/rate-limit";

/**
 * Kept isolated from routes until the public resolver itself is reconciled.
 * The key contains an IP prefix only and never a tag identifier or profile data.
 */
export function allowPublicTagRequest(ip: string) {
  return checkRateLimit(`public-tag:${ip.slice(0, 128)}`, {
    limit: 30,
    windowMs: 60_000,
  }).allowed;
}
