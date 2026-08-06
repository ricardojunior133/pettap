import { describe, expect, it } from "vitest";
import { allowPublicTagRequest } from "@/features/public-tags/services/public-tag-rate-limit";

describe("public tag resolver safeguards", () => {
  it("keeps private contact and medical fields out of the public profile type", () => { const resolution = { kind: "profile" as const, tagId: "PTP-1", status: "active" as const, pet: { name: "Milo", species: "Dog", photoUrl: null }, medical: null, emergencyContacts: [] as [], callOwnerUrl: null }; expect(resolution.medical).toBeNull(); expect(resolution.emergencyContacts).toEqual([]); expect(resolution.callOwnerUrl).toBeNull(); });
  it("applies a process-local request limit", () => { const ip = `test-${Date.now()}`; for (let index = 0; index < 30; index += 1) expect(allowPublicTagRequest(ip)).toBe(true); expect(allowPublicTagRequest(ip)).toBe(false); });
});
