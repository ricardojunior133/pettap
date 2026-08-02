import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { CustomerPetPublicProfileRepository } from "@/features/account/repositories/customer-pet-public-profile-repository";
import { customerPetPublicProfileSchema } from "@/features/account/schemas/customer-pet-public-profile";
import { CustomerPetPublicProfileService } from "@/features/account/services/customer-pet-public-profile-service";

const accountId = "11111111-1111-1111-1111-111111111111";
const otherAccountId = "22222222-2222-2222-2222-222222222222";
const profile = { publicId: "pet_public", enabled: true, showPhoto: true, showName: true, showBreed: true, showAge: true, publicMessage: "Keep me safe.", updatedAt: new Date("2026-08-02T10:00:00.000Z") };

class FakeRepository implements CustomerPetPublicProfileRepository {
  receivedAccountId: string | null = null;
  async find(receivedAccountId: string) { this.receivedAccountId = receivedAccountId; return receivedAccountId === accountId ? profile : null; }
  async save(receivedAccountId: string, _publicIdentifier: string) { void _publicIdentifier; this.receivedAccountId = receivedAccountId; return receivedAccountId === accountId ? profile : null; }
}

describe("Customer public pet profile", () => {
  it("validates public preferences, trims messages and rejects HTML or extra fields", () => {
    expect(customerPetPublicProfileSchema.parse({ enabled: true, showPhoto: true, showName: true, showBreed: false, showAge: true, publicMessage: "  Hello  " }).publicMessage).toBe("Hello");
    expect(() => customerPetPublicProfileSchema.parse({ enabled: true, showPhoto: false, showName: false, showBreed: false, showAge: false, publicMessage: "<b>Unsafe</b>" })).toThrow();
    expect(() => customerPetPublicProfileSchema.parse({ enabled: true, showPhoto: false, showName: false, showBreed: false, showAge: false, publicMessage: "x".repeat(281) })).toThrow();
  });

  it("passes only the authenticated owner account to the repository", async () => {
    const repository = new FakeRepository();
    const service = new CustomerPetPublicProfileService(repository, async () => accountId);
    await expect(service.save("pet_public", { enabled: true, showPhoto: true, showName: true, showBreed: true, showAge: true, publicMessage: "Keep me safe." })).resolves.toMatchObject({ enabled: true, publicMessage: "Keep me safe." });
    expect(repository.receivedAccountId).toBe(accountId);
    expect(repository.receivedAccountId).not.toBe(otherAccountId);
  });

  it("returns null for a pet outside the authenticated owner scope", async () => {
    const repository = new FakeRepository();
    const service = new CustomerPetPublicProfileService(repository, async () => otherAccountId);
    await expect(service.get("pet_public")).resolves.toBeNull();
  });

  it("uses owner-scoped persistence, safe audit metadata and no direct contact fields", () => {
    const source = readFileSync("features/account/repositories/customer-pet-public-profile-repository.ts", "utf8");
    expect(source).toContain("eq(pets.accountId, accountId)");
    expect(source).toContain("onConflictDoUpdate");
    expect(source).toContain("pet.public_profile_updated");
    expect(source).not.toContain("email");
    expect(source).not.toContain("phone");
    expect(source).not.toContain("publicMessage: input.publicMessage }");
  });

  it("keeps the browser action same-origin, rate-limited and free of internal identifiers", () => {
    const source = readFileSync("features/account/actions/customer-pet-public-profile-actions.ts", "utf8");
    expect(source).toContain("isSameOriginRequest");
    expect(source).toContain("checkRateLimit");
    expect(source).toContain("petPublicIdentifierSchema");
    expect(source).not.toContain("accountId");
  });
});
