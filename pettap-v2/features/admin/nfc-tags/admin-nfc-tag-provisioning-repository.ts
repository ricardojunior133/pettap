import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { accounts, auditLogs, nfcTags } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

type DatabaseExecutor = ReturnType<typeof createDatabaseClient>;
type TransactionExecutor = Parameters<DatabaseExecutor["transaction"]>[0] extends (transaction: infer Transaction) => unknown ? Transaction : never;

export type AdminProvisionedNfcTag = {
  publicCode: string;
  status: "unassigned";
  accountId: string;
  createdAt: Date;
};

export type AdminNfcTagProvisioningResult =
  | { kind: "created"; tag: AdminProvisionedNfcTag }
  | { kind: "existing"; tag: AdminProvisionedNfcTag }
  | { kind: "account_not_found" };

export interface AdminNfcTagProvisioningRepository {
  createInitialTestTag(accountId: string, publicCodeCandidates: readonly string[]): Promise<AdminNfcTagProvisioningResult>;
}

/**
 * Creates at most one initial inventory tag for the authenticated test account.
 * The database transaction and account-scoped advisory lock make repeated
 * submissions idempotent without persisting any credential or activation.
 */
export class DrizzleAdminNfcTagProvisioningRepository implements AdminNfcTagProvisioningRepository {
  async createInitialTestTag(accountId: string, publicCodeCandidates: readonly string[]): Promise<AdminNfcTagProvisioningResult> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${accountId}))`);

      const [account] = await transaction.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, accountId)).limit(1);
      if (!account) return { kind: "account_not_found" };

      const existing = await this.findInitialTag(transaction, accountId);
      if (existing) {
        await this.recordAudit(transaction, accountId, existing.id, "tag.test_inventory_reused");
        return { kind: "existing", tag: this.toTag(existing, accountId) };
      }

      for (const publicCode of publicCodeCandidates) {
        const [created] = await transaction.insert(nfcTags).values({
          publicId: publicCode,
          accountId,
          petId: null,
          status: "unassigned",
        }).onConflictDoNothing({ target: nfcTags.publicId }).returning({
          id: nfcTags.id,
          publicCode: nfcTags.publicId,
          status: nfcTags.status,
          createdAt: nfcTags.createdAt,
        });
        if (!created) continue;
        await this.recordAudit(transaction, accountId, created.id, "tag.test_inventory_created");
        return { kind: "created", tag: this.toTag(created, accountId) };
      }

      throw new Error("Unable to allocate a unique NFC tag public code.");
    });
  }

  private async findInitialTag(transaction: TransactionExecutor, accountId: string) {
    const [tag] = await transaction.select({
      id: nfcTags.id,
      publicCode: nfcTags.publicId,
      status: nfcTags.status,
      createdAt: nfcTags.createdAt,
    }).from(nfcTags).where(and(
      eq(nfcTags.accountId, accountId),
      eq(nfcTags.status, "unassigned"),
      isNull(nfcTags.petId),
    )).orderBy(desc(nfcTags.createdAt)).limit(1);
    return tag ?? null;
  }

  private toTag(tag: { publicCode: string; status: string; createdAt: Date }, accountId: string): AdminProvisionedNfcTag {
    if (tag.status !== "unassigned") throw new Error("Invalid initial NFC tag status.");
    return { publicCode: tag.publicCode, status: "unassigned", accountId, createdAt: tag.createdAt };
  }

  private async recordAudit(transaction: TransactionExecutor, accountId: string, tagId: string, action: string) {
    await transaction.insert(auditLogs).values({
      accountId,
      action,
      targetType: "nfc_tag",
      targetId: tagId,
      result: "success",
      metadata: { source: "admin_test_inventory" },
    });
  }
}
