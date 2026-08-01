import { checkRateLimit } from "@/lib/security/rate-limit";

/** Dedicated public-contact policy: deliberately separate from auth and Lost Mode. */
export function allowFinderContact(actorFingerprint: string) {
  return checkRateLimit(`finder-contact:${actorFingerprint.slice(0, 128)}`, { limit: 3, windowMs: 15 * 60_000 }).allowed;
}
