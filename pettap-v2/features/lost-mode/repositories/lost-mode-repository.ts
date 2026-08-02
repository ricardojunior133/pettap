import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { auditLogs, lostReports, nfcTagStatusHistory, nfcTags, pets, tagActivations } from "@/db/schema";
import type { NfcTagStatus } from "@/features/nfc/domain/tag-status";
import { createDatabaseClient } from "@/lib/backend/db";

type Database = ReturnType<typeof createDatabaseClient>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type LostModePet = { id: string; accountId: string };
export type LostModeTag = { id: string; petId: string | null; accountId: string | null; status: NfcTagStatus; updatedAt: Date };
export type OpenLostReport = { id: string; tagId: string | null; petId: string; actorAccountId: string | null };
export type LostModeStatus = { tag: LostModeTag; report: OpenLostReport | null; activationAt: Date | null };
export type LostModeAudit = { action: "lost.enabled" | "lost.disabled" | "lost.enable_denied" | "lost.disable_denied" | "lost.inconsistent"; accountId: string; tagId: string | null; result?: "success" | "denied"; metadata: { petId: string; status?: NfcTagStatus; reason?: string } };

export interface LostModeTransaction {
  findOwnedPetForUpdate(accountId: string, petId: string): Promise<LostModePet | null>;
  findAssociatedTagForUpdate(accountId: string, petId: string): Promise<LostModeTag | null>;
  findOpenReportForUpdate(tagId: string): Promise<OpenLostReport | null>;
  createOpenReport(input: { petId: string; tagId: string; actorAccountId: string; details: string | null; openedAt: Date }): Promise<void>;
  closeOpenReport(reportId: string, closedAt: Date): Promise<void>;
  updateTagStatus(tagId: string, expected: NfcTagStatus, next: NfcTagStatus): Promise<boolean>;
  addStatusHistory(input: { tagId: string; previousStatus: NfcTagStatus; newStatus: NfcTagStatus; accountId: string; reasonCode: string }): Promise<void>;
  recordAudit(audit: LostModeAudit): Promise<void>;
}

export interface LostModeRepository {
  transaction<T>(petId: string, callback: (transaction: LostModeTransaction) => Promise<T>): Promise<T>;
  getCurrentStatus(accountId: string, petId: string): Promise<LostModeStatus | null>;
}

class DrizzleLostModeTransaction implements LostModeTransaction {
  constructor(private readonly tx: Transaction) {}

  async findOwnedPetForUpdate(accountId: string, petId: string) {
    const [pet] = await this.tx.select({ id: pets.id, accountId: pets.accountId }).from(pets).where(and(eq(pets.id, petId), eq(pets.accountId, accountId), isNull(pets.archivedAt))).for("update").limit(1);
    return pet ?? null;
  }
  async findAssociatedTagForUpdate(accountId: string, petId: string) {
    const [tag] = await this.tx.select({ id: nfcTags.id, petId: nfcTags.petId, accountId: nfcTags.accountId, status: nfcTags.status, updatedAt: nfcTags.updatedAt }).from(nfcTags).innerJoin(tagActivations, and(eq(tagActivations.tagId, nfcTags.id), eq(tagActivations.accountId, accountId), eq(tagActivations.status, "active"))).where(and(eq(nfcTags.petId, petId), eq(nfcTags.accountId, accountId))).for("update").limit(1);
    return tag ? { ...tag, status: tag.status as NfcTagStatus } : null;
  }
  async findOpenReportForUpdate(tagId: string) {
    const [report] = await this.tx.select({ id: lostReports.id, tagId: lostReports.tagId, petId: lostReports.petId, actorAccountId: lostReports.actorAccountId }).from(lostReports).where(and(eq(lostReports.tagId, tagId), eq(lostReports.status, "open"))).for("update").limit(1);
    return report ?? null;
  }
  async createOpenReport(input: { petId: string; tagId: string; actorAccountId: string; details: string | null; openedAt: Date }) { await this.tx.insert(lostReports).values({ petId: input.petId, tagId: input.tagId, actorAccountId: input.actorAccountId, status: "open", details: input.details ? { note: input.details } : {}, openedAt: input.openedAt }); }
  async closeOpenReport(reportId: string, closedAt: Date) { await this.tx.update(lostReports).set({ status: "closed", closedAt, updatedAt: closedAt }).where(and(eq(lostReports.id, reportId), eq(lostReports.status, "open"))); }
  async updateTagStatus(tagId: string, expected: NfcTagStatus, next: NfcTagStatus) { const rows = await this.tx.update(nfcTags).set({ status: next, updatedAt: new Date() }).where(and(eq(nfcTags.id, tagId), eq(nfcTags.status, expected))).returning({ id: nfcTags.id }); return rows.length === 1; }
  async addStatusHistory(input: { tagId: string; previousStatus: NfcTagStatus; newStatus: NfcTagStatus; accountId: string; reasonCode: string }) { await this.tx.insert(nfcTagStatusHistory).values({ tagId: input.tagId, previousStatus: input.previousStatus, newStatus: input.newStatus, changedByAccountId: input.accountId, reasonCode: input.reasonCode }); }
  async recordAudit(audit: LostModeAudit) { await this.tx.insert(auditLogs).values({ accountId: audit.accountId, action: audit.action, targetType: "nfc_tag", targetId: audit.tagId, result: audit.result ?? "success", metadata: audit.metadata }); }
}

export class DrizzleLostModeRepository implements LostModeRepository {
  async transaction<T>(petId: string, callback: (transaction: LostModeTransaction) => Promise<T>): Promise<T> { const database = createDatabaseClient(); return database.transaction(async (tx) => { await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${petId}))`); return callback(new DrizzleLostModeTransaction(tx)); }); }
  async getCurrentStatus(accountId: string, petId: string): Promise<LostModeStatus | null> {
    const database = createDatabaseClient();
    const [tag] = await database.select({ id: nfcTags.id, petId: nfcTags.petId, accountId: nfcTags.accountId, status: nfcTags.status, updatedAt: nfcTags.updatedAt }).from(nfcTags).innerJoin(tagActivations, and(eq(tagActivations.tagId, nfcTags.id), eq(tagActivations.accountId, accountId), eq(tagActivations.status, "active"))).where(and(eq(nfcTags.petId, petId), eq(nfcTags.accountId, accountId))).limit(1);
    if (!tag) return null;
    const [activation] = await database.select({ createdAt: tagActivations.createdAt }).from(tagActivations).where(and(eq(tagActivations.tagId, tag.id), eq(tagActivations.accountId, accountId), eq(tagActivations.status, "active"))).orderBy(desc(tagActivations.createdAt)).limit(1);
    const [report] = await database.select({ id: lostReports.id, tagId: lostReports.tagId, petId: lostReports.petId, actorAccountId: lostReports.actorAccountId }).from(lostReports).where(and(eq(lostReports.tagId, tag.id), eq(lostReports.status, "open"))).limit(1);
    return { tag: { ...tag, status: tag.status as NfcTagStatus }, report: report ?? null, activationAt: activation?.createdAt ?? null };
  }
}
