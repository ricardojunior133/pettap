import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { AdminContextViewModel } from "@/features/admin/types/admin";
import {
  generateNfcTagCredential,
  hashNfcTagCredential,
  isNfcTagCredential,
} from "@/features/nfc/tag-credentials/credential-crypto";
import type { NfcTagCredentialAuditService } from "@/features/nfc/tag-credentials/nfc-tag-credential-audit-service";
import {
  ActiveNfcTagCredentialExistsError,
  type NewNfcTagCredential,
  type NfcTagCredentialRecord,
  type NfcTagCredentialRepository,
} from "@/features/nfc/tag-credentials/nfc-tag-credential-repository";
import { NfcTagCredentialService } from "@/features/nfc/tag-credentials/nfc-tag-credential-service";

const tagId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const otherTagId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const actor: AdminContextViewModel = {
  userId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  accountId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  membershipId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  role: "admin",
  permissions: ["tags.manage"],
};

class MemoryCredentialRepository implements NfcTagCredentialRepository {
  records: NfcTagCredentialRecord[] = [];

  async issue(input: NewNfcTagCredential) {
    if (this.records.some((record) => record.tagId === input.tagId && record.status === "active")) {
      throw new ActiveNfcTagCredentialExistsError();
    }
    const record = this.create(input);
    this.records.push(record);
    return record;
  }

  async rotate(input: NewNfcTagCredential) {
    const active = this.records.find((record) => record.tagId === input.tagId && record.status === "active");
    if (!active) throw new Error("active credential missing");
    active.status = "rotated";
    active.rotatedAt = new Date();
    const record = this.create(input);
    this.records.push(record);
    return record;
  }

  async revoke(inputTagId: string) {
    const active = this.records.find((record) => record.tagId === inputTagId && record.status === "active");
    if (!active) throw new Error("active credential missing");
    active.status = "revoked";
    active.revokedAt = new Date();
    return active;
  }

  async findActiveByTagId(inputTagId: string) {
    return this.records.find((record) => record.tagId === inputTagId && record.status === "active") ?? null;
  }

  async findActiveByPublicCode(publicCode: string) {
    return publicCode === "PET-1" ? this.findActiveByTagId(tagId) : null;
  }

  private create(input: NewNfcTagCredential): NfcTagCredentialRecord {
    return {
      id: `${this.records.length + 1}`,
      ...input,
      status: "active",
      createdAt: new Date(),
      rotatedAt: null,
      revokedAt: null,
    };
  }
}

class MemoryAuditService implements NfcTagCredentialAuditService {
  entries: Array<{ action: string; tagId: string; hint: string }> = [];

  async record(input: { action: string; tagId: string; hint: string }) {
    this.entries.push(input);
  }
}

function createService(repository = new MemoryCredentialRepository(), auditService = new MemoryAuditService()) {
  return {
    repository,
    auditService,
    service: new NfcTagCredentialService(repository, auditService, async () => actor),
  };
}

describe("NFC tag credential foundation", () => {
  it("generates unique URL-safe credentials from 256 bits of CSPRNG output", () => {
    const first = generateNfcTagCredential();
    const second = generateNfcTagCredential();
    expect(first).not.toEqual(second);
    expect(first).toMatch(/^pttc_[A-Za-z0-9_-]{43}$/);
    expect(isNfcTagCredential(first)).toBe(true);
  });

  it("persists only a hash and records only a six-character hint", async () => {
    const { service, repository, auditService } = createService();
    const issued = await service.issueCredential(tagId);
    const [stored] = repository.records;

    expect(stored.credentialHash).toBe(hashNfcTagCredential(issued.credential));
    expect(JSON.stringify(stored)).not.toContain(issued.credential);
    expect(stored.credentialHint).toBe(issued.credential.slice(-6));
    expect(JSON.stringify(auditService.entries)).not.toContain(issued.credential);
    expect(JSON.stringify(auditService.entries)).not.toContain(stored.credentialHash);
  });

  it("validates only an active credential for its requested tag or public code", async () => {
    const { service } = createService();
    const issued = await service.issueCredential(tagId);
    expect(await service.verifyCredential({ tagId }, issued.credential)).toBe(true);
    expect(await service.verifyCredential({ publicCode: "PET-1" }, issued.credential)).toBe(true);
    expect(await service.verifyCredential({ tagId: otherTagId }, issued.credential)).toBe(false);
    expect(await service.verifyCredential({ tagId }, generateNfcTagCredential())).toBe(false);
  });

  it("rotates atomically at the repository boundary and invalidates the prior credential", async () => {
    const { service, repository, auditService } = createService();
    const first = await service.issueCredential(tagId);
    const second = await service.rotateCredential(tagId);

    expect(await service.verifyCredential({ tagId }, first.credential)).toBe(false);
    expect(await service.verifyCredential({ tagId }, second.credential)).toBe(true);
    expect(repository.records.filter((record) => record.tagId === tagId && record.status === "active")).toHaveLength(1);
    expect(repository.records.some((record) => record.status === "rotated" && record.rotatedAt)).toBe(true);
    expect(auditService.entries.map((entry) => entry.action)).toEqual(["nfc.credential_issued", "nfc.credential_rotated"]);
  });

  it("revokes immediately without returning the credential", async () => {
    const { service, repository, auditService } = createService();
    const issued = await service.issueCredential(tagId);
    await expect(service.revokeCredential(tagId)).resolves.toBeUndefined();
    expect(await service.verifyCredential({ tagId }, issued.credential)).toBe(false);
    expect(repository.records[0]).toMatchObject({ status: "revoked" });
    expect(auditService.entries.at(-1)?.action).toBe("nfc.credential_revoked");
  });

  it("does not create two active credentials when concurrent issue requests race", async () => {
    const { service, repository } = createService();
    const results = await Promise.allSettled([service.issueCredential(tagId), service.issueCredential(tagId)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(repository.records.filter((record) => record.status === "active")).toHaveLength(1);
  });

  it("fails closed before persistence when the actor lacks tags.manage", async () => {
    const repository = new MemoryCredentialRepository();
    const auditService = new MemoryAuditService();
    const service = new NfcTagCredentialService(repository, auditService, async () => {
      throw new Error("permission denied");
    });
    await expect(service.issueCredential(tagId)).rejects.toThrow("permission denied");
    expect(repository.records).toHaveLength(0);
    expect(auditService.entries).toHaveLength(0);
  });

  it("defines the database backstops for lifecycle concurrency and private access", () => {
    const migration = readFileSync(resolve(process.cwd(), "db/migrations/0012_nfc_tag_credential_foundation.sql"), "utf8");
    expect(migration).toContain('CREATE UNIQUE INDEX "nfc_tag_credentials_one_active_per_tag"');
    expect(migration).toContain('WHERE "nfc_tag_credentials"."status" = \'active\'');
    expect(migration).toContain('ALTER TABLE "nfc_tag_credentials" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL ON TABLE "nfc_tag_credentials" FROM anon, authenticated');

    const repositorySource = readFileSync(resolve(process.cwd(), "features/nfc/tag-credentials/nfc-tag-credential-repository.ts"), "utf8");
    expect(repositorySource).toContain("pg_advisory_xact_lock");
  });
});
