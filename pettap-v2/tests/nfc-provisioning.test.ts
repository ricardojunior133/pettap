import { describe, expect, it } from "vitest";
import { buildNfcProvisioningPayload } from "@/features/nfc/provisioning/provisioning-payload";
import { ManualNfcWriterAdapter, UnsupportedNfcWriterAdapter } from "@/features/nfc/provisioning/nfc-writer-adapter";
import { generateProvisioningChallenge, hashProvisioningChallenge, matchesProvisioningChallenge } from "@/features/nfc/provisioning/provisioning-crypto";

describe("physical NFC provisioning contract", () => {
  it("builds a deterministic, PII-free and credential-free NFC URI", () => {
    const first = buildNfcProvisioningPayload("https://pettap.co.uk/anything", "PT-123 A");
    expect(first).toEqual(buildNfcProvisioningPayload("https://pettap.co.uk", "PT-123 A"));
    expect(first.value).toBe("https://pettap.co.uk/nfc/v1/t/PT-123%20A");
    expect(first.value).not.toMatch(/credential|challenge|profile/i);
  });

  it("stores only a verifiable hash for the short-lived write challenge", () => {
    const challenge = generateProvisioningChallenge();
    const hash = hashProvisioningChallenge(challenge);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(challenge);
    expect(matchesProvisioningChallenge(challenge, hash)).toBe(true);
    expect(matchesProvisioningChallenge(`${challenge}x`, hash)).toBe(false);
  });

  it("requires exact scanner read-back and has a safe unsupported default", async () => {
    const expected = buildNfcProvisioningPayload("https://pettap.co.uk", "PT-123");
    const manual = new ManualNfcWriterAdapter(expected);
    expect(await manual.isSupported()).toBe(true);
    expect(manual.verify(expected, await manual.readBack())).toBe(true);
    const unsupported = new UnsupportedNfcWriterAdapter();
    expect(await unsupported.isSupported()).toBe(false);
    expect(unsupported.verify(expected, null)).toBe(false);
  });
});
