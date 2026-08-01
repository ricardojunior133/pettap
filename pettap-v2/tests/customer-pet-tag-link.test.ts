import { describe, expect, it } from "vitest";

import { customerPetTagLinkSchema, customerPetTagPublicIdentifierSchema } from "@/features/account/schemas/customer-pet-tag-link";
import { CustomerPetTagLinkService } from "@/features/account/services/customer-pet-tag-link-service";

const accountId = "11111111-1111-1111-1111-111111111111";
const petPublicIdentifier = "pet_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const tag = { publicCode: "PT-TEST-001", linkedAt: new Date("2026-08-01T12:00:00.000Z") };

describe("CustomerPetTagLinkService", () => {
  it("links only through the server-resolved account and returns a safe view", async () => {
    let received: [string, string, string] | null = null;
    const service = new CustomerPetTagLinkService({
      findLinkedTag: async () => received ? tag : null,
      linkOwnedEligibleTag: async (account, pet, publicCode) => { received = [account, pet, publicCode]; return "linked"; },
    }, async () => accountId);

    await expect(service.link(petPublicIdentifier, { publicCode: tag.publicCode })).resolves.toEqual({
      ok: true,
      link: { publicCode: tag.publicCode, linkedAt: "2026-08-01T12:00:00.000Z" },
    });
    expect(received).toEqual([accountId, petPublicIdentifier, tag.publicCode]);
  });

  it.each([
    ["pet_not_found", "PET_NOT_FOUND"],
    ["pet_already_linked", "PET_ALREADY_LINKED"],
    ["tag_unavailable", "TAG_UNAVAILABLE"],
  ] as const)("does not disclose tag data for %s", async (outcome, code) => {
    const service = new CustomerPetTagLinkService({
      findLinkedTag: async () => null,
      linkOwnedEligibleTag: async () => outcome,
    }, async () => accountId);
    await expect(service.link(petPublicIdentifier, { publicCode: tag.publicCode })).resolves.toEqual({ ok: false, code });
  });
});

describe("Customer pet tag link input", () => {
  it("accepts a canonical public code and rejects arbitrary values", () => {
    expect(customerPetTagLinkSchema.parse({ publicCode: "  PT-TEST_001  " })).toEqual({ publicCode: "PT-TEST_001" });
    expect(() => customerPetTagLinkSchema.parse({ publicCode: "<script>" })).toThrow();
    expect(() => customerPetTagLinkSchema.parse({ publicCode: "PT-1", extra: "nope" })).toThrow();
  });

  it("allows only opaque pet public identifiers", () => {
    expect(customerPetTagPublicIdentifierSchema.parse(petPublicIdentifier)).toBe(petPublicIdentifier);
    expect(() => customerPetTagPublicIdentifierSchema.parse("11111111-1111-1111-1111-111111111111")).toThrow();
  });
});
