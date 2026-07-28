import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { CustomerPetFoundationRepository, OwnedPetFoundationRecord } from "@/features/account/repositories/customer-pet-foundation-repository";
import type { CustomerTagFoundationPage, CustomerTagFoundationPagination, CustomerTagFoundationRepository, OwnedTagFoundationRecord } from "@/features/account/repositories/customer-tag-foundation-repository";
import { CustomerPetFoundationService } from "@/features/account/services/customer-pet-foundation-service";
import { CustomerTagFoundationService, toCustomerTagFoundationDto } from "@/features/account/services/customer-tag-foundation-service";

const accountA = "11111111-1111-1111-1111-111111111111";
const accountB = "22222222-2222-2222-2222-222222222222";

function pet(overrides: Partial<OwnedPetFoundationRecord> = {}): OwnedPetFoundationRecord {
  return { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", publicId: "pet-public-charlie", name: "Charlie", archivedAt: null, ...overrides };
}

function tag(overrides: Partial<OwnedTagFoundationRecord> = {}): OwnedTagFoundationRecord {
  return { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", publicId: "tag-public-charlie", status: "active", createdAt: new Date("2026-07-28T10:00:00.000Z"), pet: { ...pet(), publicProfileEnabled: true }, activatedAt: new Date("2026-07-28T11:00:00.000Z"), ...overrides };
}

class FakePetRepository implements CustomerPetFoundationRepository {
  readonly calls: Array<{ method: string; accountId: string; value?: string }> = [];
  constructor(private readonly rows: OwnedPetFoundationRecord[] = [pet()]) {}
  async listOwnedPets(accountId: string) { this.calls.push({ method: "list", accountId }); return this.rows; }
  async findOwnedPetByPublicIdentifier(accountId: string, publicIdentifier: string) { this.calls.push({ method: "public", accountId, value: publicIdentifier }); return this.rows.find((row) => row.publicId === publicIdentifier) ?? null; }
  async findOwnedPetByInternalId(accountId: string, internalId: string) { this.calls.push({ method: "internal", accountId, value: internalId }); return this.rows.find((row) => row.id === internalId) ?? null; }
}

class FakeTagRepository implements CustomerTagFoundationRepository {
  readonly calls: Array<{ method: string; accountId: string; value?: string; pagination?: CustomerTagFoundationPagination }> = [];
  constructor(private readonly page: CustomerTagFoundationPage = { rows: [tag()], total: 1 }) {}
  async listOwnedTags(accountId: string, pagination: CustomerTagFoundationPagination) { this.calls.push({ method: "list", accountId, pagination }); return this.page; }
  async findOwnedTagByPublicId(accountId: string, publicId: string) { this.calls.push({ method: "public", accountId, value: publicId }); return this.page.rows.find((row) => row.publicId === publicId) ?? null; }
  async findTagAssociation(accountId: string, publicId: string) { return this.findOwnedTagByPublicId(accountId, publicId); }
  async findLatestActivationForOwnedTag(accountId: string, publicId: string) { return (await this.findOwnedTagByPublicId(accountId, publicId))?.activatedAt ?? null; }
}

describe("NFC and pets foundation", () => {
  it("lists pets only through the authenticated account and omits internal identifiers", async () => {
    const repository = new FakePetRepository();
    const service = new CustomerPetFoundationService(repository, async () => accountA);
    const result = await service.listOwnedPets();
    expect(repository.calls).toEqual([{ method: "list", accountId: accountA }]);
    expect(result).toEqual([{ publicIdentifier: "pet-public-charlie", name: "Charlie", archived: false, primaryPhotoUrl: null }]);
    expect(Object.keys(result[0] ?? {})).not.toEqual(expect.arrayContaining(["id", "accountId", "storagePath"]));
  });

  it("does not resolve another account's pet by changing a public identifier", async () => {
    const repository = new FakePetRepository([]);
    const service = new CustomerPetFoundationService(repository, async () => accountA);
    await expect(service.getOwnedPet("pet-for-account-b")).resolves.toBeNull();
    expect(repository.calls).toEqual([{ method: "public", accountId: accountA, value: "pet-for-account-b" }]);
  });

  it("lists tags with authenticated ownership and deterministic server pagination", async () => {
    const repository = new FakeTagRepository({ rows: [tag({ publicId: "tag-new" }), tag({ publicId: "tag-old", createdAt: new Date("2026-07-27") })], total: 13 });
    const service = new CustomerTagFoundationService(repository, async () => accountA);
    const result = await service.listOwnedTags(2);
    expect(repository.calls).toEqual([{ method: "list", accountId: accountA, pagination: { page: 2, pageSize: 12 } }]);
    expect(result).toMatchObject({ page: 2, pageSize: 12, total: 13, totalPages: 2 });
    expect(result.tags.map((item) => item.publicIdentifier)).toEqual(["tag-new", "tag-old"]);
  });

  it("returns no tag for another account and never accepts an account identifier from input", async () => {
    const repository = new FakeTagRepository({ rows: [], total: 0 });
    const service = new CustomerTagFoundationService(repository, async () => accountA);
    await expect(service.getOwnedTag("tag-for-account-b")).resolves.toBeNull();
    expect(repository.calls).toEqual([{ method: "public", accountId: accountA, value: "tag-for-account-b" }]);
  });

  it("exposes only safe tag and pet public identifiers in the DTO", () => {
    const result = toCustomerTagFoundationDto(tag());
    expect(result).toEqual({ publicIdentifier: "tag-public-charlie", status: "Active", activatedAt: "2026-07-28T11:00:00.000Z", petSummary: { publicIdentifier: "pet-public-charlie", name: "Charlie", archived: false }, canOpenPublicProfile: true, canBeAssigned: false });
    expect(Object.keys(result)).not.toEqual(expect.arrayContaining(["id", "accountId", "petId", "token", "tokenHash", "activationSecret"]));
  });

  it("handles unknown and incomplete legacy tag records safely", () => {
    const unknown = toCustomerTagFoundationDto(tag({ status: "legacy_status" as never, pet: null, activatedAt: null }));
    expect(unknown).toMatchObject({ status: "Unavailable", petSummary: null, activatedAt: null, canOpenPublicProfile: false, canBeAssigned: false });
  });

  it("keeps all database NFC and pet reads owner-scoped", () => {
    const tags = readFileSync(resolve(process.cwd(), "features/account/repositories/customer-tag-foundation-repository.ts"), "utf8");
    const pets = readFileSync(resolve(process.cwd(), "features/account/repositories/customer-pet-foundation-repository.ts"), "utf8");
    expect(tags).toContain("eq(nfcTags.accountId, accountId)");
    expect(tags).toContain("eq(nfcTags.accountId, accountId), eq(nfcTags.publicId, publicId)");
    expect(pets).toContain("eq(pets.accountId, accountId)");
    expect(pets).toContain("eq(pets.accountId, accountId), eq(pets.publicId, publicIdentifier)");
    const activations = readFileSync(resolve(process.cwd(), "features/account/repositories/customer-tag-activation-foundation-repository.ts"), "utf8");
    expect(activations).toContain("eq(nfcTags.accountId, accountId)");
    expect(activations).toContain("eq(tagActivations.accountId, accountId)");
  });

  it("matches the NFC and pets SQL mappings already declared by reconciled migrations", () => {
    const migration = readFileSync(resolve(process.cwd(), "db/migrations/0000_chilly_nebula.sql"), "utf8");
    const core = readFileSync(resolve(process.cwd(), "db/schema/core.ts"), "utf8");
    expect(migration).toContain('CREATE TYPE "public"."tag_status" AS ENUM(\'unassigned\', \'active\', \'suspended\', \'lost\', \'retired\')');
    expect(migration).toContain('CREATE TABLE "nfc_tags"');
    expect(migration).toContain('CREATE TABLE "pets"');
    expect(migration).toContain('CREATE TABLE "tag_activations"');
    expect(core).toContain('pgEnum("tag_status", ["unassigned", "active", "suspended", "lost", "retired"])');
    expect(core).toContain('publicId: text("public_id").notNull()');
    expect(core).toContain('archivedAt: timestamp("archived_at"');
    expect(core).toContain('suspendedAt: timestamp("suspended_at"');
  });

  it("does not make a remote query or mutation when account resolution fails", async () => {
    const repository = new FakeTagRepository();
    const service = new CustomerTagFoundationService(repository, async () => { throw new Error("Authentication is required"); });
    await expect(service.listOwnedTags()).rejects.toThrow("Authentication is required");
    expect(repository.calls).toEqual([]);
    expect(accountB).not.toBe(accountA);
  });
});
