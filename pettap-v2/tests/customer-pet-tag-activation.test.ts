import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  CustomerPetTagActivationRecord,
  CustomerPetTagActivationRepository,
  CustomerPetTagActivationWriteResult,
} from "@/features/account/repositories/customer-pet-tag-activation-repository";
import { CustomerPetTagActivationService } from "@/features/account/services/customer-pet-tag-activation-service";

const accountId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const petPublicIdentifier = "pet_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const activatedAt = new Date("2026-08-02T10:00:00.000Z");
const activation: CustomerPetTagActivationRecord = { publicCode: "PT-TEST-001", status: "active", activatedAt };

class FakeActivationRepository implements CustomerPetTagActivationRepository {
  state: "unassigned" | "active" | "suspended" | "lost" | "retired" = "unassigned";
  outcome: Extract<CustomerPetTagActivationWriteResult, { kind: "pet_not_found" | "tag_not_linked" | "tag_not_eligible" }> | null = null;
  calls: string[] = [];
  activationCount = 0;

  async findOwnedLinkedTag(inputAccountId: string, inputPet: string): Promise<CustomerPetTagActivationRecord | null> {
    if (inputAccountId !== accountId || inputPet !== petPublicIdentifier || this.outcome?.kind === "tag_not_linked") return null;
    return { publicCode: activation.publicCode, status: this.state, activatedAt: this.state === "active" ? activatedAt : null };
  }

  async activateOwnedLinkedTag(inputAccountId: string, inputPet: string): Promise<CustomerPetTagActivationWriteResult> {
    this.calls.push(`${inputAccountId}:${inputPet}`);
    if (inputAccountId !== accountId || inputPet !== petPublicIdentifier) return { kind: "tag_not_linked" };
    if (this.outcome) return this.outcome;
    if (this.state === "active") return { kind: "activated", activation, idempotent: true };
    if (this.state !== "unassigned") return { kind: "tag_not_eligible" };
    this.state = "active";
    this.activationCount += 1;
    return { kind: "activated", activation, idempotent: false };
  }
}

function service(repository = new FakeActivationRepository(), resolveAccountId: () => Promise<string> = async () => accountId) {
  return { repository, service: new CustomerPetTagActivationService(repository, resolveAccountId) };
}

describe("CustomerPetTagActivationService", () => {
  it("activates the owner-linked unassigned tag and returns only the safe public view", async () => {
    const { service: subject, repository } = service();
    await expect(subject.activate(petPublicIdentifier)).resolves.toEqual({
      ok: true,
      idempotent: false,
      activation: { publicCode: "PT-TEST-001", status: "active", activatedAt: activatedAt.toISOString(), readyForPublicProfile: true },
    });
    expect(repository.calls).toEqual([`${accountId}:${petPublicIdentifier}`]);
  });

  it("is idempotent and accepts two concurrent owner requests with one activation", async () => {
    const { service: subject, repository } = service();
    const results = await Promise.all([subject.activate(petPublicIdentifier), subject.activate(petPublicIdentifier)]);
    expect(results.filter((result) => result.ok)).toHaveLength(2);
    expect(results.some((result) => result.ok && result.idempotent)).toBe(true);
    expect(repository.activationCount).toBe(1);
  });

  it("does not activate a tag for another account or another pet", async () => {
    const { service: anotherAccount } = service(undefined, async () => "cccccccc-cccc-cccc-cccc-cccccccccccc");
    await expect(anotherAccount.activate(petPublicIdentifier)).resolves.toEqual({ ok: false, code: "TAG_NOT_LINKED" });

    const { service: anotherPet } = service();
    await expect(anotherPet.activate("pet_cccccccccccccccccccccccccccccccc")).resolves.toEqual({ ok: false, code: "TAG_NOT_LINKED" });
  });

  it.each([
    ["suspended"],
    ["retired"],
    ["lost"],
  ] as const)("rejects a %s tag without exposing its status", async (state) => {
    const { service: subject, repository } = service();
    repository.state = state;
    await expect(subject.activate(petPublicIdentifier)).resolves.toEqual({ ok: false, code: "TAG_NOT_ELIGIBLE" });
  });

  it.each([
    [{ kind: "pet_not_found" } as const, "PET_NOT_FOUND"],
    [{ kind: "tag_not_linked" } as const, "TAG_NOT_LINKED"],
    [{ kind: "tag_not_eligible" } as const, "TAG_NOT_ELIGIBLE"],
  ])("returns safe results for owner, link and state failures", async (outcome, code) => {
    const { service: subject, repository } = service();
    repository.outcome = outcome;
    await expect(subject.activate(petPublicIdentifier)).resolves.toEqual({ ok: false, code });
  });

  it("does not call the repository without an authenticated account", async () => {
    const { service: subject, repository } = service(undefined, async () => { throw new Error("No session"); });
    await expect(subject.activate(petPublicIdentifier)).resolves.toEqual({ ok: false, code: "AUTHENTICATION_REQUIRED" });
    expect(repository.calls).toEqual([]);
  });

  it("keeps owner scope, advisory locking, state history and safe audit writes in the transaction", () => {
    const source = readFileSync(resolve(process.cwd(), "features/account/repositories/customer-pet-tag-activation-repository.ts"), "utf8");
    expect(source).toContain("database.transaction");
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("eq(nfcTags.accountId, accountId)");
    expect(source).toContain("eq(nfcTags.petId, pet.id)");
    expect(source).toContain("nfcTagStatusHistory");
    expect(source).toContain('action: "tag.activated"');
    expect(source).toContain('action: "tag.activation_denied"');
    expect(source).not.toContain("credentialHash");
    expect(source).not.toContain("credential:");
  });

  it("renders the linked, active and ready-for-public-profile states without internal identifiers", () => {
    const source = readFileSync(resolve(process.cwd(), "features/account/components/customer-pet-tag-link-card.tsx"), "utf8");
    expect(source).toContain("No NFC tag linked");
    expect(source).toContain("Link NFC Tag");
    expect(source).toContain("Activate Tag");
    expect(source).toContain("Tag Active");
    expect(source).toContain("Activation date");
    expect(source).toContain("Ready for Public Profile");
    expect(source).not.toContain("credential");
  });

  it("keeps the server action parameter validated and revalidates only account pages after success", () => {
    const source = readFileSync(resolve(process.cwd(), "features/account/actions/customer-pet-tag-activation-actions.ts"), "utf8");
    expect(source).toContain("customerPetTagPublicIdentifierSchema.parse");
    expect(source).toContain("service.activate");
    expect(source).toContain('revalidatePath("/account")');
    expect(source).not.toContain("credential");
  });
});
