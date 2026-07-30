import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const CREDENTIAL_PREFIX = "pttc_";
const CREDENTIAL_BYTES = 32;
const HASH_HEX_LENGTH = 64;
const credentialPattern = /^pttc_[A-Za-z0-9_-]{43}$/;
const hashPattern = /^[a-f0-9]{64}$/;

/** Generates a URL-safe credential from 256 bits of CSPRNG output. */
export function generateNfcTagCredential(): string {
  return `${CREDENTIAL_PREFIX}${randomBytes(CREDENTIAL_BYTES).toString("base64url")}`;
}

export function isNfcTagCredential(value: unknown): value is string {
  return typeof value === "string" && credentialPattern.test(value);
}

export function hashNfcTagCredential(credential: string): string {
  if (!isNfcTagCredential(credential)) {
    throw new Error("Invalid NFC tag credential format.");
  }

  return createHash("sha256").update(credential, "utf8").digest("hex");
}

/** Returns only a support-safe suffix; it cannot be used to reconstruct a credential. */
export function getNfcTagCredentialHint(credential: string): string {
  if (!isNfcTagCredential(credential)) {
    throw new Error("Invalid NFC tag credential format.");
  }

  return credential.slice(-6);
}

/** Performs a fixed-length comparison and returns no detail about why verification failed. */
export function matchesNfcTagCredential(credential: string, storedHash: string): boolean {
  return isNfcTagCredential(credential)
    && matchesNfcTagCredentialHash(hashNfcTagCredential(credential), storedHash);
}

/** Supports transaction-scoped verification without passing plaintext to a repository. */
export function matchesNfcTagCredentialHash(candidateHash: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashPattern.test(candidateHash) ? candidateHash : "0".repeat(HASH_HEX_LENGTH), "hex");
  const stored = hashPattern.test(storedHash) ? Buffer.from(storedHash, "hex") : Buffer.alloc(candidate.length);
  return timingSafeEqual(candidate, stored) && hashPattern.test(candidateHash) && hashPattern.test(storedHash);
}
