import { describe, expect, it } from "vitest";

import {
  createActivationCredentialDraft,
  generateActivationCredentialToken,
  getActivationCredentialState,
  hashActivationCredentialToken,
  inspectActivationCredential,
  isActivationCredentialToken,
  matchesActivationCredentialToken,
  type StoredActivationCredential,
} from "@/features/nfc/activation-credentials/contract";

const now = new Date("2026-07-28T12:00:00.000Z");
const tagA = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const tagB = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

function stored(token: string, overrides: Partial<StoredActivationCredential> = {}): StoredActivationCredential {
  return {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    tagId: tagA,
    tokenHash: hashActivationCredentialToken(token),
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60_000),
    consumedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

describe("NFC activation credential contract", () => {
  it("generates unique, route-safe tokens with 256 bits of random input", () => {
    const first = generateActivationCredentialToken();
    const second = generateActivationCredentialToken();
    expect(first).not.toEqual(second);
    expect(isActivationCredentialToken(first)).toBe(true);
    expect(first).toMatch(/^ptac_[A-Za-z0-9_-]{43}$/);
  });

  it("keeps plaintext out of the persistence shape and hashes distinct tokens distinctly", () => {
    const first = createActivationCredentialDraft(now, 60_000);
    const second = createActivationCredentialDraft(now, 60_000);
    const persisted = stored(first.token);
    expect(first.tokenHash).not.toEqual(second.tokenHash);
    expect(Object.keys(persisted)).not.toContain("token");
    expect(persisted.tokenHash).not.toContain(first.token);
  });

  it("recognizes a valid credential only for its bound tag", () => {
    const token = generateActivationCredentialToken();
    const record = stored(token);
    expect(inspectActivationCredential(record, token, tagA, now)).toEqual({
      valid: true,
      credentialId: record.id,
      tagId: tagA,
    });
    expect(inspectActivationCredential(record, token, tagB, now)).toEqual({ valid: false });
    expect(inspectActivationCredential(record, "ptac_invalid", tagA, now)).toEqual({ valid: false });
  });

  it("rejects expired, revoked, and consumed credentials with the same generic result", () => {
    const token = generateActivationCredentialToken();
    expect(inspectActivationCredential(stored(token, { expiresAt: now }), token, tagA, now)).toEqual({ valid: false });
    expect(inspectActivationCredential(stored(token, { revokedAt: now }), token, tagA, now)).toEqual({ valid: false });
    expect(inspectActivationCredential(stored(token, { consumedAt: now }), token, tagA, now)).toEqual({ valid: false });
  });

  it("uses a timing-safe hash comparison for malformed and mismatched hashes", () => {
    const token = generateActivationCredentialToken();
    expect(matchesActivationCredentialToken(token, hashActivationCredentialToken(token))).toBe(true);
    expect(matchesActivationCredentialToken(token, hashActivationCredentialToken(generateActivationCredentialToken()))).toBe(false);
    expect(matchesActivationCredentialToken(token, "not-a-hash")).toBe(false);
  });

  it("defines lifecycle precedence without claiming atomic persistence", () => {
    const token = generateActivationCredentialToken();
    expect(getActivationCredentialState(stored(token), now)).toBe("valid");
    expect(getActivationCredentialState(stored(token, { expiresAt: now }), now)).toBe("expired");
    expect(getActivationCredentialState(stored(token, { consumedAt: now }), now)).toBe("consumed");
    expect(getActivationCredentialState(stored(token, { revokedAt: now, consumedAt: now }), now)).toBe("revoked");
  });

  it("does not provide a repository, service, action, tag activation, or pet association", () => {
    const draft = createActivationCredentialDraft(now, 60_000);
    expect(draft.expiresAt).toEqual(new Date(now.getTime() + 60_000));
    expect(Object.keys(draft)).toEqual(["token", "tokenHash", "issuedAt", "expiresAt"]);
  });
});
