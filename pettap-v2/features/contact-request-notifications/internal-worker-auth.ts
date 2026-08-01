import "server-only";

import { timingSafeEqual } from "node:crypto";

export type BearerSecretVerification = "authorized" | "missing_secret" | "unauthorized";

/**
 * Validates a server-only Bearer credential without exposing configuration state.
 * It deliberately accepts no query or body fallback.
 */
export function verifyBearerSecret(authorization: string | null, configuredSecret: string | undefined): BearerSecretVerification {
  if (!configuredSecret) return "missing_secret";
  if (!authorization?.startsWith("Bearer ")) return "unauthorized";
  const supplied = authorization.slice("Bearer ".length);
  const expectedBytes = Buffer.from(configuredSecret, "utf8");
  const suppliedBytes = Buffer.from(supplied, "utf8");
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes) ? "authorized" : "unauthorized";
}

/** Keeps the existing manual worker route contract separate from CRON_SECRET. */
export function isContactNotificationWorkerAuthorized(authorization: string | null, configuredSecret: string | undefined): boolean {
  return verifyBearerSecret(authorization, configuredSecret) === "authorized";
}
