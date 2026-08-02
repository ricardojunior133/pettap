import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { AdminNfcTagRepository } from "@/features/admin/nfc-tags/admin-nfc-tag-repository";
import { AdminNfcTagService, parseAdminNfcTagQuery } from "@/features/admin/nfc-tags/admin-nfc-tag-service";

const createdAt = new Date("2026-08-01T10:00:00.000Z");
const updatedAt = new Date("2026-08-02T10:00:00.000Z");

class FakeAdminNfcTagRepository implements AdminNfcTagRepository {
  input: unknown;
  async list(input: Parameters<AdminNfcTagRepository["list"]>[0]) {
    this.input = input;
    return { rows: [{ publicCode: "PT_TEST_001", status: "unassigned" as const, accountId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", petName: null, createdAt, updatedAt }], total: 1 };
  }
}

describe("AdminNfcTagService", () => {
  it("requires tags.manage and returns only the allowlisted operational view", async () => {
    const repository = new FakeAdminNfcTagRepository();
    const permissions: string[] = [];
    const service = new AdminNfcTagService(repository, async (permission) => { permissions.push(permission); return {} as never; });
    await expect(service.list({ publicCode: "PT_TEST", unassigned: "true", withoutPet: "true" })).resolves.toMatchObject({ tags: [{ publicCode: "PT_TEST_001", status: "unassigned", petName: null, accountReference: "Account ••••aaaaaa" }], total: 1 });
    expect(permissions).toEqual(["tags.manage"]);
    expect(repository.input).toMatchObject({ publicCode: "PT_TEST", unassignedOnly: true, withoutPet: true, page: 1, pageSize: 20 });
  });

  it("accepts only the canonical filters and ignores malformed values", () => {
    expect(parseAdminNfcTagQuery({ status: "active", page: "2", publicCode: "PT_TEST-01", unassigned: "false", withoutPet: "true" })).toEqual({ page: 2, publicCode: "PT_TEST-01", status: "active", unassignedOnly: false, withoutPet: true });
    expect(parseAdminNfcTagQuery({ status: "unknown", publicCode: "%" })).toEqual({ page: 1, publicCode: "", status: undefined, unassignedOnly: false, withoutPet: false });
  });

  it("keeps the repository server-side, paginated, filtered and free of sensitive selections", () => {
    const source = readFileSync(resolve(process.cwd(), "features/admin/nfc-tags/admin-nfc-tag-repository.ts"), "utf8");
    expect(source).toContain('import "server-only"');
    expect(source).toContain("ilike(nfcTags.publicId");
    expect(source).toContain('eq(nfcTags.status, "unassigned")');
    expect(source).toContain("isNull(nfcTags.petId)");
    expect(source).toContain(".limit(input.pageSize)");
    expect(source).not.toContain("credentialHash");
    expect(source).not.toContain("phone:");
    expect(source).not.toContain("email:");
  });

  it("renders a read-only route with RBAC, filters and safe empty pagination", () => {
    const source = readFileSync(resolve(process.cwd(), "app/admin/tags/page.tsx"), "utf8");
    expect(source).toContain("AdminNfcTagService");
    expect(source).toContain("Public Code");
    expect(source).toContain("Unassigned only");
    expect(source).toContain("Without pet linked");
    expect(source).toContain("No NFC tags match these filters.");
    expect(source).toContain("notFound()");
    expect(source).not.toContain("credential");
  });
});
