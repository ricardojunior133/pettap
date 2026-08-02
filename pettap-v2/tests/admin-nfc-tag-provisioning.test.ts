import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { AdminNfcTagProvisioningRepository } from "@/features/admin/nfc-tags/admin-nfc-tag-provisioning-repository";
import { AdminNfcTagProvisioningService } from "@/features/admin/nfc-tags/admin-nfc-tag-provisioning-service";

const accountId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const createdAt = new Date("2026-08-02T10:00:00.000Z");

class FakeProvisioningRepository implements AdminNfcTagProvisioningRepository {
  input: { accountId: string; publicCodeCandidates: readonly string[] } | null = null;
  result: Awaited<ReturnType<AdminNfcTagProvisioningRepository["createInitialTestTag"]>> = {
    kind: "created",
    tag: { publicCode: "PT_123456789012345678901234", status: "unassigned", accountId, createdAt },
  };

  async createInitialTestTag(inputAccountId: string, publicCodeCandidates: readonly string[]) {
    this.input = { accountId: inputAccountId, publicCodeCandidates };
    return this.result;
  }
}

function serviceFor(repository: FakeProvisioningRepository, permission = async () => ({ accountId } as never)) {
  let sequence = 0;
  return new AdminNfcTagProvisioningService(repository, permission as never, () => `PT_${String(++sequence).padStart(24, "0")}`);
}

describe("Admin NFC test inventory provisioning", () => {
  it("creates an unassigned, pet-free tag for only the verified tags.manage account", async () => {
    const repository = new FakeProvisioningRepository();
    const required: string[] = [];
    const service = serviceFor(repository, async (permission) => { required.push(permission); return { accountId } as never; });

    await expect(service.createInitialTestTag()).resolves.toEqual({
      ok: true,
      tag: {
        publicCode: "PT_123456789012345678901234",
        status: "unassigned",
        accountReference: "Account ••••aaaaaa",
        createdAt: createdAt.toISOString(),
        idempotent: false,
      },
    });
    expect(required).toEqual(["tags.manage"]);
    expect(repository.input).toEqual({
      accountId,
      publicCodeCandidates: ["PT_000000000000000000000001", "PT_000000000000000000000002", "PT_000000000000000000000003"],
    });
  });

  it("is idempotent when an unassigned tag already exists for the test account", async () => {
    const repository = new FakeProvisioningRepository();
    repository.result = { kind: "existing", tag: { publicCode: "PT_123456789012345678901234", status: "unassigned", accountId, createdAt } };
    const result = await serviceFor(repository).createInitialTestTag();
    expect(result).toMatchObject({ ok: true, tag: { publicCode: "PT_123456789012345678901234", idempotent: true, status: "unassigned" } });
  });

  it("returns a generic failure when the authenticated account no longer exists", async () => {
    const repository = new FakeProvisioningRepository();
    repository.result = { kind: "account_not_found" };
    await expect(serviceFor(repository).createInitialTestTag()).resolves.toEqual({ ok: false });
  });

  it("does not bypass permission checks for unauthenticated or unauthorised callers", async () => {
    const repository = new FakeProvisioningRepository();
    const denied = serviceFor(repository, async () => { throw new Error("permission denied"); });
    await expect(denied.createInitialTestTag()).rejects.toThrow("permission denied");
    expect(repository.input).toBeNull();
  });

  it("uses one transaction, collision-safe public-code insertion and PII-free auditing", () => {
    const source = readFileSync(resolve(process.cwd(), "features/admin/nfc-tags/admin-nfc-tag-provisioning-repository.ts"), "utf8");
    expect(source).toContain("database.transaction");
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("onConflictDoNothing");
    expect(source).toContain('status: "unassigned"');
    expect(source).toContain("petId: null");
    expect(source).toContain("tag.test_inventory_created");
    expect(source).toContain("tag.test_inventory_reused");
    expect(source).not.toContain("credentialHash");
    expect(source).not.toContain("publicCode: publicCode");
    expect(source).not.toContain("email");
    expect(source).not.toContain("phone");
  });

  it("keeps account selection server-owned and exposes no credential, token or hash", () => {
    const serviceSource = readFileSync(resolve(process.cwd(), "features/admin/nfc-tags/admin-nfc-tag-provisioning-service.ts"), "utf8");
    const actionSource = readFileSync(resolve(process.cwd(), "features/admin/nfc-tags/admin-nfc-tag-provisioning-actions.ts"), "utf8");
    const formSource = readFileSync(resolve(process.cwd(), "features/admin/nfc-tags/admin-nfc-tag-create-form.tsx"), "utf8");
    expect(serviceSource).toContain('requirePermission("tags.manage")');
    expect(serviceSource).toContain("randomBytes(18)");
    expect(actionSource).toContain('"use server"');
    expect(actionSource).toContain("isSameOriginRequest");
    expect(actionSource).toContain("checkRateLimit");
    expect(formSource).toContain("Create test tag");
    expect(formSource).not.toContain("<input");
    for (const source of [serviceSource, actionSource]) {
      expect(source).not.toContain("credential");
      expect(source).not.toContain("token");
      expect(source).not.toContain("hash");
    }
  });
});
