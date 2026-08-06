import "server-only";

import { checkRateLimit } from "@/lib/security/rate-limit";

export function allowPublicTagRequest(ip: string) {
  return checkRateLimit(`public-tag:${ip.slice(0, 128)}`, { limit: 30, windowMs: 60_000 }).allowed;
}
