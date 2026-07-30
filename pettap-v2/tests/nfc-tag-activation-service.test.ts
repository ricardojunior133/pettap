import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { generateNfcTagCredential, hashNfcTagCredential } from "@/features/nfc/tag-credentials/credential-crypto";
import {
  type NfcTagActivationInput,
  type NfcTagActivationRepository,
  type NfcTagActivationTag,
  type TagActivationResult,
} from "@/features/nfc/tag-activation/nfc-tag-activation-repository";
import { NfcTagActivationService } from "@/features/nfc/tag-activation/nfc-tag-activation-service";
import { canTransition, InvalidNfcTagStatusTransitionError, transition } from "@/features/nfc/domain/tag-status";

const accountId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const petId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const tagId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const credential = generateNfcTagCredential();

class FakeActivationRepository implements NfcTagActivationRepository {
  calls: NfcTagActivationInput[] = [];
  result: TagActivationResult = { ok: true, tagId, petId, activationId: "dddddddd-dddd-dddd-dddd-dddddddddddd" };
  owned = true;
  active = false;

  async findByPublicCode(publicCode: string): Promise<NfcTagActivationTag | null> {
    return publicCode === "PT-FOUND" ? { id: tagId, publicCode, status: this.active ? "active" : "unassigned", accountId: this.active ? accountId : null, petId: this.active ? petId : null } : null;
  }

  async isPetOwnedByAccount(inputAccountId: string, inputPetId: string): Promise<boolean> {
    return this.owned && inputAccountId === accountId && inputPetId === petId;
  }

  async activate(input: NfcTagActivationInput): Promise<TagActivationResult> {
    this.calls.push(input);
    if (this.active) return { ok: false, code: "TAG_ALREADY_ASSIGNED" };
    if (this.result.ok) this.active = true;
    return this.result;
  }

  async changeStatus(input: { publicCode: string; targetStatus: NfcTagActivationTag["status"]; actorAccountId: string }): Promise<NfcTagActivationTag | null> {
    return input.publicCode === "PT-FOUND" ? { id: tagId, publicCode: input.publicCode, status: input.targetStatus, accountId: input.actorAccountId, petId } : null;
  }
}

function createService(repository = new FakeActivationRepository(), authenticated = true) {
  return {
    repository,
    service: new NfcTagActivationService(
      repository,
      async () => authenticated ? ({ id: accountId } as never) : null,
      async () => ({ accountId } as never),
    ),
  };
}

describe("NFC tag activation", () => {
  it("activates an unassigned tag only with an authenticated account and credential hash", async () => {
    const { service, repository } = createService();
    await expect(service.activateTag({ publicCode: "PT-FOUND", credential, petId })).resolves.toMatchObject({ ok: true, tagId, petId });
    expect(repository.calls).toHaveLength(1);
    expect(repository.calls[0]).toMatchObject({ publicCode: "PT-FOUND", accountId, petId, credentialHash: hashNfcTagCredential(credential) });
    expect(JSON.stringify(repository.calls[0])).not.toContain(credential);
  });

  it.each([
    "TAG_NOT_FOUND",
    "TAG_ALREADY_ASSIGNED",
    "PET_NOT_FOUND",
    "PET_NOT_OWNED",
    "INVALID_CREDENTIAL",
  ] as const)("returns the safe %s result from the transaction", async (code) => {
    const repository = new FakeActivationRepository();
    repository.result = { ok: false, code };
    const { service } = createService(repository);
    await expect(service.activateTag({ publicCode: "PT-FOUND", credential, petId })).resolves.toEqual({ ok: false, code });
  });

  it("uses a non-matching candidate hash for malformed credentials", async () => {
    const { service, repository } = createService();
    await service.activateTag({ publicCode: "PT-FOUND", credential: "not-a-credential", petId });
    expect(repository.calls[0].credentialHash).toBe("0".repeat(64));
  });

  it("does not attempt activation without an authenticated account", async () => {
    const { service, repository } = createService(undefined, false);
    await expect(service.activateTag({ publicCode: "PT-FOUND", credential, petId })).resolves.toEqual({ ok: false, code: "ACCOUNT_INACTIVE" });
    expect(repository.calls).toHaveLength(0);
  });

  it("verifies ownership from the authenticated account only", async () => {
    const { service, repository } = createService();
    await expect(service.verifyOwnership(petId)).resolves.toBe(true);
    repository.owned = false;
    await expect(service.verifyOwnership(petId)).resolves.toBe(false);
  });

  it("rejects a second concurrent activation and leaves exactly one active result", async () => {
    const { service, repository } = createService();
    const attempts = await Promise.all([
      service.activateTag({ publicCode: "PT-FOUND", credential, petId }),
      service.activateTag({ publicCode: "PT-FOUND", credential, petId }),
    ]);
    expect(attempts.filter((attempt) => attempt.ok)).toHaveLength(1);
    expect(attempts.filter((attempt) => !attempt.ok && attempt.code === "TAG_ALREADY_ASSIGNED")).toHaveLength(1);
    expect(repository.active).toBe(true);
  });

  it("leaves association state untouched when the transaction reports a failed activation", async () => {
    const repository = new FakeActivationRepository();
    repository.result = { ok: false, code: "INVALID_CREDENTIAL" };
    const { service } = createService(repository);
    await expect(service.activateTag({ publicCode: "PT-FOUND", credential, petId })).resolves.toEqual({ ok: false, code: "INVALID_CREDENTIAL" });
    expect(repository.active).toBe(false);
  });

  it("uses tags.manage for administrative status transitions", async () => {
    const { service } = createService();
    await expect(service.changeStatus("PT-FOUND", "suspended")).resolves.toMatchObject({ status: "suspended", accountId });
  });

  it("centralizes the complete allowed lifecycle and rejects invalid transitions", () => {
    expect(canTransition("unassigned", "active")).toBe(true);
    expect(canTransition("active", "suspended")).toBe(true);
    expect(canTransition("suspended", "active")).toBe(true);
    expect(canTransition("active", "lost")).toBe(true);
    expect(canTransition("lost", "active")).toBe(true);
    expect(canTransition("active", "retired")).toBe(true);
    expect(canTransition("unassigned", "lost")).toBe(false);
    expect(canTransition("retired", "active")).toBe(false);
    expect(() => transition("active", "unassigned")).toThrow(InvalidNfcTagStatusTransitionError);
  });

  it("keeps activation writes, duplicate/failure audit, locking, and timing-safe verification in the repository transaction", () => {
    const source = readFileSync(resolve(process.cwd(), "features/nfc/tag-activation/nfc-tag-activation-repository.ts"), "utf8");
    expect(source).toContain("database.transaction");
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("matchesNfcTagCredentialHash");
    expect(source).toContain('action: "tag.activated"');
    expect(source).toContain('action: "tag.activation_failed"');
    expect(source).toContain('action: "tag.activation_duplicate"');
    expect(source).not.toContain("credential:");
  });
});
