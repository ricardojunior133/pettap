import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const urlSafeToken = (bytes: number) => randomBytes(bytes).toString("base64url");

/** Public identifiers are random and route-safe; they are not credentials. */
export function generateEventDemoPublicCode(): string {
  return `demo_${urlSafeToken(12)}`;
}

export function generateEventDemoPublicId(): string {
  return `ed_${urlSafeToken(18)}`;
}

/** This value is shown only to the browser in a future public flow. Persist its hash only. */
export function generateEventDemoSessionToken(): string {
  return urlSafeToken(32);
}

export function hashEventDemoSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function verifyEventDemoSessionToken(token: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashEventDemoSessionToken(token), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}
