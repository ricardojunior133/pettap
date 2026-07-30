import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";

import { accounts, auditLogs, nfcTagCredentials, nfcTagStatusHistory, nfcTags, pets, tagActivations } from "@/db/schema";
import { transition, type NfcTagStatus } from "@/features/nfc/domain/tag-status";
import { matchesNfcTagCredentialHash } from "@/features/nfc/tag-credentials/credential-crypto";
import { createDatabaseClient } from "@/lib/backend/db";

export type TagActivationFailureCode =
  | "TAG_NOT_FOUND"
  | "TAG_ALREADY_ASSIGNED"
  | "PET_NOT_FOUND"
  | "PET_NOT_OWNED"
  | "ACCOUNT_INACTIVE"
  | "INVALID_CREDENTIAL";

export type TagActivationResult =
  | { ok: true; tagId: string; petId: string; activationId: string }
  | { ok: false; code: TagActivationFailureCode };

export type NfcTagActivationInput = {
  publicCode: string;
  credentialHash: string;
  accountId: string;
  petId: string;
};

export type NfcTagActivationTag = {
  id: string;
  publicCode: string;
  status: NfcTagStatus;
  accountId: string | null;
  petId: string | null;
};

export interface NfcTagActivationRepository {
  findByPublicCode(publicCode: string): Promise<NfcTagActivationTag | null>;
  isPetOwnedByAccount(accountId: string, petId: string): Promise<boolean>;
  activate(input: NfcTagActivationInput): Promise<TagActivationResult>;
  changeStatus(input: { publicCode: string; targetStatus: NfcTagStatus; actorAccountId: string }): Promise<NfcTagActivationTag | null>;
}

function tagRecord(record: typeof nfcTags.$inferSelect): NfcTagActivationTag {
  return {
    id: record.id,
    publicCode: record.publicId,
    status: record.status as NfcTagStatus,
    accountId: record.accountId,
    petId: record.petId,
  };
}

/** All activation writes are isolated in one transaction guarded by the public-code lock. */
export class DrizzleNfcTagActivationRepository implements NfcTagActivationRepository {
  async findByPublicCode(publicCode: string): Promise<NfcTagActivationTag | null> {
    const database = createDatabaseClient();
    const [tag] = await database.select().from(nfcTags).where(eq(nfcTags.publicId, publicCode)).limit(1);
    return tag ? tagRecord(tag) : null;
  }

  async isPetOwnedByAccount(accountId: string, petId: string): Promise<boolean> {
    const database = createDatabaseClient();
    const [pet] = await database.select({ id: pets.id }).from(pets)
      .where(and(eq(pets.id, petId), eq(pets.accountId, accountId), isNull(pets.archivedAt))).limit(1);
    return Boolean(pet);
  }

  async activate(input: NfcTagActivationInput): Promise<TagActivationResult> {
    return this.withPublicCodeLock(input.publicCode, async (database) => {
      const [account] = await database.select({ id: accounts.id }).from(accounts).where(eq(accounts.id, input.accountId)).limit(1);
      if (!account) return { ok: false, code: "ACCOUNT_INACTIVE" };

      const [tag] = await database.select().from(nfcTags).where(eq(nfcTags.publicId, input.publicCode)).limit(1);
      if (!tag) {
        await this.auditFailure(database, input, null, "TAG_NOT_FOUND");
        return { ok: false, code: "TAG_NOT_FOUND" };
      }
      if (tag.status !== "unassigned") {
        await this.auditDuplicate(database, input, tag.id, tag.status as NfcTagStatus);
        return { ok: false, code: "TAG_ALREADY_ASSIGNED" };
      }

      const [pet] = await database.select({ id: pets.id, accountId: pets.accountId }).from(pets)
        .where(and(eq(pets.id, input.petId), isNull(pets.archivedAt))).limit(1);
      if (!pet) {
        await this.auditFailure(database, input, tag.id, "PET_NOT_FOUND");
        return { ok: false, code: "PET_NOT_FOUND" };
      }
      if (pet.accountId !== input.accountId) {
        await this.auditFailure(database, input, tag.id, "PET_NOT_OWNED");
        return { ok: false, code: "PET_NOT_OWNED" };
      }

      const [credential] = await database.select({ credentialHash: nfcTagCredentials.credentialHash })
        .from(nfcTagCredentials)
        .where(and(eq(nfcTagCredentials.tagId, tag.id), eq(nfcTagCredentials.status, "active")))
        .limit(1);
      if (!credential || !matchesNfcTagCredentialHash(input.credentialHash, credential.credentialHash)) {
        await this.auditFailure(database, input, tag.id, "INVALID_CREDENTIAL");
        return { ok: false, code: "INVALID_CREDENTIAL" };
      }

      const nextStatus = transition(tag.status as NfcTagStatus, "active");
      const [activation] = await database.insert(tagActivations).values({
        tagId: tag.id,
        accountId: input.accountId,
        status: "active",
      }).returning({ id: tagActivations.id });

      const [updatedTag] = await database.update(nfcTags).set({
        accountId: input.accountId,
        petId: input.petId,
        status: nextStatus,
        updatedAt: new Date(),
      }).where(and(eq(nfcTags.id, tag.id), eq(nfcTags.status, "unassigned"))).returning({ id: nfcTags.id });
      if (!updatedTag) throw new Error("NFC tag state changed during activation.");

      await database.insert(nfcTagStatusHistory).values({
        tagId: tag.id,
        previousStatus: "unassigned",
        newStatus: nextStatus,
        reasonCode: "activation",
        changedByAccountId: input.accountId,
      });
      await database.insert(auditLogs).values({
        accountId: input.accountId,
        action: "tag.activated",
        targetType: "nfc_tag",
        targetId: tag.id,
        metadata: { petId: input.petId },
      });

      return { ok: true, tagId: tag.id, petId: input.petId, activationId: activation.id };
    });
  }

  async changeStatus(input: { publicCode: string; targetStatus: NfcTagStatus; actorAccountId: string }): Promise<NfcTagActivationTag | null> {
    return this.withPublicCodeLock(input.publicCode, async (database) => {
      const [tag] = await database.select().from(nfcTags).where(eq(nfcTags.publicId, input.publicCode)).limit(1);
      if (!tag) return null;
      const nextStatus = transition(tag.status as NfcTagStatus, input.targetStatus);
      const [updated] = await database.update(nfcTags).set({ status: nextStatus, updatedAt: new Date() })
        .where(eq(nfcTags.id, tag.id)).returning();
      await database.insert(nfcTagStatusHistory).values({
        tagId: tag.id,
        previousStatus: tag.status as NfcTagStatus,
        newStatus: nextStatus,
        reasonCode: "status_change",
        changedByAccountId: input.actorAccountId,
      });
      return tagRecord(updated);
    });
  }

  private async withPublicCodeLock<T>(publicCode: string, callback: (database: ReturnType<typeof createDatabaseClient>) => Promise<T>): Promise<T> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      await transaction.execute(sql`select pg_advisory_xact_lock(hashtext(${publicCode}))`);
      return callback(transaction);
    });
  }

  private async auditFailure(
    database: ReturnType<typeof createDatabaseClient>,
    input: NfcTagActivationInput,
    tagId: string | null,
    code: Exclude<TagActivationFailureCode, "TAG_ALREADY_ASSIGNED">,
  ): Promise<void> {
    await database.insert(auditLogs).values({
      accountId: input.accountId,
      action: "tag.activation_failed",
      targetType: "nfc_tag",
      targetId: tagId,
      result: "denied",
      metadata: { petId: input.petId, code },
    });
  }

  private async auditDuplicate(
    database: ReturnType<typeof createDatabaseClient>,
    input: NfcTagActivationInput,
    tagId: string,
    status: NfcTagStatus,
  ): Promise<void> {
    await database.insert(auditLogs).values({
      accountId: input.accountId,
      action: "tag.activation_duplicate",
      targetType: "nfc_tag",
      targetId: tagId,
      result: "denied",
      metadata: { petId: input.petId, status },
    });
  }
}
