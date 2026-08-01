import { describe, expect, it } from "vitest";

import type { LostModeAudit, LostModeRepository, LostModeStatus, LostModeTag, LostModeTransaction, OpenLostReport } from "@/features/lost-mode/repositories/lost-mode-repository";
import { LostModeService } from "@/features/lost-mode/services/lost-mode-service";

const accountA = "11111111-1111-4111-8111-111111111111";
const accountB = "22222222-2222-4222-8222-222222222222";
const petId = "33333333-3333-4333-8333-333333333333";

class FakeLostModeRepository implements LostModeRepository, LostModeTransaction {
  tag: LostModeTag | null = { id: "44444444-4444-4444-8444-444444444444", accountId: accountA, petId, status: "active" };
  report: OpenLostReport | null = null;
  audits: LostModeAudit[] = [];
  history: Array<{ previous: string; next: string }> = [];
  rollback = false;
  owner = accountA;
  failCreate = false;

  async transaction<T>(_petId: string, callback: (tx: LostModeTransaction) => Promise<T>): Promise<T> {
    const status = this.tag?.status;
    const report = this.report;
    try { return await callback(this); } catch (error) { this.rollback = true; if (this.tag && status) this.tag.status = status; this.report = report; throw error; }
  }
  async getCurrentStatus(accountId: string, requestedPetId: string): Promise<LostModeStatus | null> { return accountId === this.owner && requestedPetId === petId && this.tag ? { tag: this.tag, report: this.report } : null; }
  async findOwnedPetForUpdate(accountId: string, requestedPetId: string) { return accountId === this.owner && requestedPetId === petId ? { id: petId, accountId } : null; }
  async findAssociatedTagForUpdate(accountId: string) { return accountId === this.owner ? this.tag : null; }
  async findOpenReportForUpdate() { return this.report; }
  async createOpenReport(input: { petId: string; tagId: string; actorAccountId: string }) { if (this.failCreate) throw new Error("write failure"); this.report = { id: "55555555-5555-4555-8555-555555555555", tagId: input.tagId, petId: input.petId, actorAccountId: input.actorAccountId }; }
  async closeOpenReport() { this.report = null; }
  async updateTagStatus(_tagId: string, expected: LostModeTag["status"], next: LostModeTag["status"]) { if (!this.tag || this.tag.status !== expected) return false; this.tag.status = next; return true; }
  async addStatusHistory(input: { previousStatus: LostModeTag["status"]; newStatus: LostModeTag["status"] }) { this.history.push({ previous: input.previousStatus, next: input.newStatus }); }
  async recordAudit(audit: LostModeAudit) { this.audits.push(audit); }
}

function service(repo: FakeLostModeRepository, account = accountA) {
  return new LostModeService(repo, async () => account, () => new Date("2026-01-02T03:04:05.000Z"));
}

describe("LostModeService", () => {
  it("enables Lost Mode atomically, records a report, status history and a PII-free audit", async () => {
    const repo = new FakeLostModeRepository(); const instance = service(repo);
    await expect(instance.enable({ petId, details: "Please help" })).resolves.toEqual({ state: "enabled", tagId: repo.tag!.id });
    expect(repo.tag!.status).toBe("lost"); expect(repo.report?.petId).toBe(petId); expect(repo.history).toEqual([{ previous: "active", next: "lost" }]);
    expect(repo.audits).toEqual([{ action: "lost.enabled", accountId: accountA, tagId: repo.tag!.id, metadata: { petId, status: "lost" } }]);
    expect(JSON.stringify(repo.audits)).not.toContain("Please help");
  });

  it("disables Lost Mode, closes the report and preserves the history", async () => {
    const repo = new FakeLostModeRepository(); repo.tag!.status = "lost"; repo.report = { id: "55555555-5555-4555-8555-555555555555", tagId: repo.tag!.id, petId, actorAccountId: accountA };
    const instance = service(repo);
    await expect(instance.disable({ petId })).resolves.toEqual({ state: "disabled", tagId: repo.tag!.id });
    expect(repo.tag!.status).toBe("active"); expect(repo.report).toBeNull(); expect(repo.history).toEqual([{ previous: "lost", next: "active" }]);
  });

  it("is idempotent for already enabled and already disabled states", async () => {
    const enabled = new FakeLostModeRepository(); enabled.tag!.status = "lost"; enabled.report = { id: "55555555-5555-4555-8555-555555555555", tagId: enabled.tag!.id, petId, actorAccountId: accountA };
    await expect(service(enabled).enable({ petId })).resolves.toMatchObject({ state: "already_enabled" });
    const disabled = new FakeLostModeRepository(); await expect(service(disabled).disable({ petId })).resolves.toMatchObject({ state: "already_disabled" });
  });

  it("blocks cross-account access and anonymous access without trusting browser account ids", async () => {
    const repo = new FakeLostModeRepository(); const other = service(repo, accountB);
    await expect(other.enable({ petId })).rejects.toMatchObject({ code: "PET_NOT_FOUND" });
    const anonymous = new LostModeService(repo, async () => { throw new Error("no session"); });
    await expect(anonymous.enable({ petId })).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("fails safe for inconsistent data and never enables suspended or retired tags", async () => {
    const inconsistent = new FakeLostModeRepository(); inconsistent.tag!.status = "lost";
    await expect(service(inconsistent).getStatus(petId)).rejects.toMatchObject({ code: "INCONSISTENT_STATE" });
    for (const status of ["suspended", "retired"] as const) { const repo = new FakeLostModeRepository(); repo.tag!.status = status; await expect(service(repo).enable({ petId })).rejects.toMatchObject({ code: "TAG_NOT_ELIGIBLE" }); }
  });

  it("rolls back partial work when a report write fails", async () => {
    const repo = new FakeLostModeRepository(); repo.failCreate = true;
    await expect(service(repo).enable({ petId })).rejects.toThrow("write failure");
    expect(repo.rollback).toBe(true); expect(repo.tag!.status).toBe("active"); expect(repo.report).toBeNull();
  });

  it("validates browser input strictly and normalizes optional details", async () => {
    const { enableLostModeSchema } = await import("@/features/lost-mode/schemas/lost-mode");
    expect(enableLostModeSchema.parse({ petId, details: "  note  " }).details).toBe("note");
    expect(() => enableLostModeSchema.parse({ petId, accountId: accountB })).toThrow();
  });
});
