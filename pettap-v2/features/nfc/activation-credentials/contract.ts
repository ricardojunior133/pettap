import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_PREFIX = "ptac_";
const TOKEN_BYTES = 32;
const TOKEN_HASH_LENGTH = 64;
const tokenPattern = /^ptac_[A-Za-z0-9_-]{43}$/;
const hashPattern = /^[a-f0-9]{64}$/;

export type ActivationCredentialState =
  | "valid"
  | "expired"
  | "consumed"
  | "revoked"
  | "invalid";

/**
 * The persistence shape required by a future repository. This remains internal:
 * no DTO or route imports it in this sprint.
 */
export type StoredActivationCredential = {
  id: string;
  tagId: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
  revokedAt: Date | null;
};

export type ActivationCredentialCheck =
  | { valid: true; credentialId: string; tagId: string }
  | { valid: false };

/** The plaintext token is present only in this in-memory, internal draft. */
export type ActivationCredentialDraft = {
  token: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
};

export function generateActivationCredentialToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(TOKEN_BYTES).toString("base64url")}`;
}

export function isActivationCredentialToken(value: unknown): value is string {
  return typeof value === "string" && tokenPattern.test(value);
}

export function hashActivationCredentialToken(token: string): string {
  if (!isActivationCredentialToken(token)) {
    throw new Error("Invalid activation credential token format.");
  }

  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Compares a candidate against a persisted hash without returning any detail
 * about malformed, expired, revoked, consumed, or mismatched credentials.
 */
export function matchesActivationCredentialToken(
  token: string,
  storedHash: string,
): boolean {
  const candidate = Buffer.from(
    isActivationCredentialToken(token)
      ? hashActivationCredentialToken(token)
      : "0".repeat(TOKEN_HASH_LENGTH),
    "hex",
  );
  const stored = hashPattern.test(storedHash)
    ? Buffer.from(storedHash, "hex")
    : Buffer.alloc(candidate.length);

  return timingSafeEqual(candidate, stored) && isActivationCredentialToken(token) && hashPattern.test(storedHash);
}

export function getActivationCredentialState(
  credential: Pick<StoredActivationCredential, "expiresAt" | "consumedAt" | "revokedAt">,
  now: Date,
): Exclude<ActivationCredentialState, "invalid"> {
  if (credential.revokedAt) return "revoked";
  if (credential.consumedAt) return "consumed";
  if (credential.expiresAt.getTime() <= now.getTime()) return "expired";
  return "valid";
}

export function inspectActivationCredential(
  credential: StoredActivationCredential | null,
  token: string,
  expectedTagId: string,
  now: Date,
): ActivationCredentialCheck {
  if (!credential || credential.tagId !== expectedTagId) return { valid: false };
  if (!matchesActivationCredentialToken(token, credential.tokenHash)) return { valid: false };
  if (getActivationCredentialState(credential, now) !== "valid") return { valid: false };
  return { valid: true, credentialId: credential.id, tagId: credential.tagId };
}

/**
 * This creates an in-memory draft only. Persisting it is intentionally blocked
 * until an approved database contract can store the hash and lifecycle fields.
 */
export function createActivationCredentialDraft(
  now: Date,
  ttlMilliseconds: number,
): ActivationCredentialDraft {
  if (!Number.isSafeInteger(ttlMilliseconds) || ttlMilliseconds <= 0) {
    throw new Error("Activation credential TTL must be a positive integer.");
  }

  const token = generateActivationCredentialToken();
  return {
    token,
    tokenHash: hashActivationCredentialToken(token),
    issuedAt: now,
    expiresAt: new Date(now.getTime() + ttlMilliseconds),
  };
}
