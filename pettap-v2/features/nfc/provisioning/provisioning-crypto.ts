import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const CHALLENGE_PREFIX = "ptps_";
const challengePattern = /^ptps_[A-Za-z0-9_-]{43}$/;
const hashPattern = /^[a-f0-9]{64}$/;

export function generateProvisioningChallenge() { return `${CHALLENGE_PREFIX}${randomBytes(32).toString("base64url")}`; }
export function hashProvisioningChallenge(challenge: string) {
  if (!challengePattern.test(challenge)) throw new Error("Invalid provisioning challenge format.");
  return createHash("sha256").update(challenge, "utf8").digest("hex");
}
/** Fixed-length verification; the supplied challenge is never persisted or logged. */
export function matchesProvisioningChallenge(challenge: string, storedHash: string) {
  const candidateHash = challengePattern.test(challenge) ? createHash("sha256").update(challenge, "utf8").digest("hex") : "0".repeat(64);
  const candidate = Buffer.from(candidateHash, "hex");
  const stored = Buffer.from(hashPattern.test(storedHash) ? storedHash : "0".repeat(64), "hex");
  return timingSafeEqual(candidate, stored) && challengePattern.test(challenge) && hashPattern.test(storedHash);
}
