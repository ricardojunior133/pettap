import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { auditLogs, nfcTagStatusHistory, nfcTags, pets, tagActivations } from "@/db/schema";
import { transition, type NfcTagStatus } from "@/features/nfc/domain/tag-status";
import { createDatabaseClient } from "@/lib/backend/db";

type DatabaseExecutor = ReturnType<typeof createDatabaseClient>;
type TransactionExecutor = Parameters<DatabaseExecutor["transaction"]>[0] extends (transaction: infer Transaction) => unknown ? Transaction : never;
type QueryExecutor = DatabaseExecutor | TransactionExecutor;

export type CustomerPetTagActivationRecord = {
  publicCode: string;
  status: NfcTagStatus;
  activatedAt: Date | null;
};

export type CustomerPetTagActivationWriteResult =
  | { kind: "activated"; activation: CustomerPetTagActivationRecord; idempotent: boolean }
  | { kind: "pet_not_found" | "tag_not_linked" | "tag_not_eligible" };

export interface CustomerPetTagActivationRepository {
  findOwnedLinkedTag(accountId: string, petPublicIdentifier: string): Promise<CustomerPetTagActivationRecord | null>;
  activateOwnedLinkedTag(accountId: string, petPublicIdentifier: string): Promise<CustomerPetTagActivationWriteResult>;
}

/**
 * Owner-only Portal activation. Physical provisioning and NFC credentials stay
 * private operational concerns; this path only promotes an already linked tag.
 */
export class DrizzleCustomerPetTagActivationRepository implements CustomerPetTagActivationRepository {
  async findOwnedLinkedTag(accountId: string, petPublicIdentifier: string): Promise<CustomerPetTagActivationRecord | null> {
    const database = createDatabaseClient();
    const tag = await this.findTag(database, accountId, petPublicIdentifier);
    if (!tag) return null;
    return { publicCode: tag.publicCode, status: tag.status as NfcTagStatus, activatedAt: await this.findActivationDate(database, tag.id, accountId) };
  }

  async activateOwnedLinkedTag(accountId: string, petPublicIdentifier: string): Promise<CustomerPetTagActivationWriteResult> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [pet] = await transaction.select({ id: pets.id })
        .from(pets)
        .where(and(eq(pets.accountId, accountId), eq(pets.publicId, petPublicIdentifier), isNull(pets.archivedAt)))
        .limit(1);
      if (!pet) {
        await this.recordDenied(transaction, accountId);
        return { kind: "pet_not_found" };
      }

      const tag = await this.findTag(transaction, accountId, petPublicIdentifier);
      if (!tag) {
        await this.recordDenied(transaction, accountId);
        return { kind: "tag_not_linked" };
      }

      await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${tag.publicCode}))`);
      const lockedTag = await this.findTag(transaction, accountId, petPublicIdentifier);
      if (!lockedTag) {
        await this.recordDenied(transaction, accountId);
        return { kind: "tag_not_linked" };
      }

      if (lockedTag.status === "active") {
        const activatedAt = await this.findActivationDate(transaction, lockedTag.id, accountId);
        if (!activatedAt) {
          await this.recordDenied(transaction, accountId, lockedTag.id);
          return { kind: "tag_not_eligible" };
        }
        return { kind: "activated", idempotent: true, activation: { publicCode: lockedTag.publicCode, status: "active", activatedAt } };
      }

      if (lockedTag.status !== "unassigned") {
        await this.recordDenied(transaction, accountId, lockedTag.id);
        return { kind: "tag_not_eligible" };
      }

      const nextStatus = transition("unassigned", "active");
      const now = new Date();
      const [activation] = await transaction.insert(tagActivations).values({
        tagId: lockedTag.id,
        accountId,
        status: "active",
      }).returning({ createdAt: tagActivations.createdAt });

      const [updated] = await transaction.update(nfcTags).set({ status: nextStatus, updatedAt: now })
        .where(and(
          eq(nfcTags.id, lockedTag.id),
          eq(nfcTags.accountId, accountId),
          eq(nfcTags.petId, pet.id),
          eq(nfcTags.status, "unassigned"),
        ))
        .returning({ id: nfcTags.id });
      if (!updated) throw new Error("NFC tag state changed during customer activation.");

      await transaction.insert(nfcTagStatusHistory).values({
        tagId: lockedTag.id,
        previousStatus: "unassigned",
        newStatus: nextStatus,
        reasonCode: "customer_activation",
        changedByAccountId: accountId,
      });
      await transaction.insert(auditLogs).values({
        accountId,
        action: "tag.activated",
        targetType: "nfc_tag",
        targetId: lockedTag.id,
        result: "success",
      });

      return { kind: "activated", idempotent: false, activation: { publicCode: lockedTag.publicCode, status: "active", activatedAt: activation.createdAt } };
    });
  }

  private async findTag(database: QueryExecutor, accountId: string, petPublicIdentifier: string) {
    const [tag] = await database.select({ id: nfcTags.id, publicCode: nfcTags.publicId, status: nfcTags.status })
      .from(pets)
      .innerJoin(nfcTags, and(eq(nfcTags.petId, pets.id), eq(nfcTags.accountId, accountId)))
      .where(and(eq(pets.accountId, accountId), eq(pets.publicId, petPublicIdentifier), isNull(pets.archivedAt)))
      .limit(1);
    return tag ?? null;
  }

  private async findActivationDate(database: QueryExecutor, tagId: string, accountId: string): Promise<Date | null> {
    const [activation] = await database.select({ createdAt: tagActivations.createdAt })
      .from(tagActivations)
      .where(and(eq(tagActivations.tagId, tagId), eq(tagActivations.accountId, accountId), eq(tagActivations.status, "active")))
      .orderBy(desc(tagActivations.createdAt))
      .limit(1);
    return activation?.createdAt ?? null;
  }

  private async recordDenied(database: QueryExecutor, accountId: string, tagId: string | null = null) {
    await database.insert(auditLogs).values({
      accountId,
      action: "tag.activation_denied",
      targetType: "nfc_tag",
      targetId: tagId,
      result: "denied",
    });
  }
}
