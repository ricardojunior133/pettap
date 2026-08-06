import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { auditLogs, nfcTagStatusHistory, nfcTags, pets, profiles, tagActivations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { ReactivateAdminTagInput, ReassignAdminTagInput, SuspendAdminTagInput } from "../schemas/admin-tag-actions";

export interface AdminTagRecord {
  id: string;
  publicId: string;
  status: "unassigned" | "active" | "suspended" | "lost" | "retired";
  accountId: string | null;
  petId: string | null;
  petName: string | null;
  ownerName: string | null;
  createdAt: Date;
  activatedAt: Date | null;
  suspendedAt: Date | null;
  suspensionReasonCode: string | null;
  suspensionReason: string | null;
}

function record(row: AdminTagRecord): AdminTagRecord {
  return row;
}

function recordFromTag(tag: typeof nfcTags.$inferSelect): AdminTagRecord {
  return { id: tag.id, publicId: tag.publicId, status: tag.status, accountId: tag.accountId, petId: tag.petId, petName: null, ownerName: null, createdAt: tag.createdAt, activatedAt: null, suspendedAt: tag.suspendedAt, suspensionReasonCode: tag.suspensionReasonCode, suspensionReason: tag.suspensionReason };
}

export interface AdminTagRepository {
  findById(tagId: string): Promise<AdminTagRecord | null>;
  listForAccount(accountId: string): Promise<AdminTagRecord[]>;
  suspend(input: SuspendAdminTagInput, actorAccountId: string): Promise<AdminTagRecord | "already-suspended" | "invalid-state" | "not-found">;
  reactivate(input: ReactivateAdminTagInput, actorAccountId: string): Promise<AdminTagRecord | "invalid-state" | "not-found">;
  reassign(input: ReassignAdminTagInput, actorAccountId: string): Promise<AdminTagRecord | "invalid-destination" | "invalid-state" | "not-found">;
}

const detailSelection = {
  id: nfcTags.id,
  publicId: nfcTags.publicId,
  status: nfcTags.status,
  accountId: nfcTags.accountId,
  petId: nfcTags.petId,
  petName: pets.name,
  ownerName: profiles.displayName,
  createdAt: nfcTags.createdAt,
  activatedAt: tagActivations.createdAt,
  suspendedAt: nfcTags.suspendedAt,
  suspensionReasonCode: nfcTags.suspensionReasonCode,
  suspensionReason: nfcTags.suspensionReason,
};

export class DrizzleAdminTagRepository implements AdminTagRepository {
  async findById(tagId: string): Promise<AdminTagRecord | null> {
    const database = createDatabaseClient();
    const [row] = await database.select(detailSelection).from(nfcTags).leftJoin(pets, eq(nfcTags.petId, pets.id)).leftJoin(profiles, eq(nfcTags.accountId, profiles.accountId)).leftJoin(tagActivations, and(eq(tagActivations.tagId, nfcTags.id), eq(tagActivations.status, "active"))).where(eq(nfcTags.id, tagId)).orderBy(desc(tagActivations.createdAt)).limit(1);
    return row ? record(row) : null;
  }

  async listForAccount(accountId: string): Promise<AdminTagRecord[]> {
    const database = createDatabaseClient();
    const rows = await database.select(detailSelection).from(nfcTags).leftJoin(pets, eq(nfcTags.petId, pets.id)).leftJoin(profiles, eq(nfcTags.accountId, profiles.accountId)).leftJoin(tagActivations, and(eq(tagActivations.tagId, nfcTags.id), eq(tagActivations.status, "active"))).where(eq(nfcTags.accountId, accountId)).orderBy(desc(nfcTags.updatedAt));
    return rows.map(record);
  }

  async suspend(input: SuspendAdminTagInput, actorAccountId: string) {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [current] = await transaction.select().from(nfcTags).where(eq(nfcTags.id, input.tagId)).limit(1);
      if (!current) return "not-found" as const;
      if (current.status === "suspended") return "already-suspended" as const;
      if (current.status === "retired") return "invalid-state" as const;
      const [updated] = await transaction.update(nfcTags).set({ status: "suspended", suspendedAt: new Date(), suspendedByAccountId: actorAccountId, suspensionReasonCode: input.reasonCode, suspensionReason: input.reason ?? null, updatedAt: new Date() }).where(and(eq(nfcTags.id, input.tagId), eq(nfcTags.status, current.status))).returning();
      if (!updated) return "invalid-state" as const;
      await transaction.insert(nfcTagStatusHistory).values({ tagId: updated.id, previousStatus: current.status, newStatus: "suspended", reasonCode: input.reasonCode, reason: input.reason ?? null, changedByAccountId: actorAccountId });
      await transaction.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.tag.suspended", targetType: "nfc_tag", targetId: updated.id, result: "success", metadata: { reasonCode: input.reasonCode } });
      return recordFromTag(updated);
    });
  }

  async reactivate(input: ReactivateAdminTagInput, actorAccountId: string) {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [current] = await transaction.select().from(nfcTags).where(eq(nfcTags.id, input.tagId)).limit(1);
      if (!current) return "not-found" as const;
      if (current.status !== "suspended") return "invalid-state" as const;
      const nextStatus = current.accountId && current.petId ? "active" : "unassigned";
      const [updated] = await transaction.update(nfcTags).set({ status: nextStatus, suspendedAt: null, suspendedByAccountId: null, suspensionReasonCode: null, suspensionReason: null, updatedAt: new Date() }).where(and(eq(nfcTags.id, input.tagId), eq(nfcTags.status, "suspended"))).returning();
      if (!updated) return "invalid-state" as const;
      await transaction.insert(nfcTagStatusHistory).values({ tagId: updated.id, previousStatus: "suspended", newStatus: nextStatus, reasonCode: input.reasonCode, reason: input.reason ?? null, changedByAccountId: actorAccountId });
      await transaction.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.tag.reactivated", targetType: "nfc_tag", targetId: updated.id, result: "success", metadata: { reasonCode: input.reasonCode } });
      return recordFromTag(updated);
    });
  }

  async reassign(input: ReassignAdminTagInput, actorAccountId: string) {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [current] = await transaction.select().from(nfcTags).where(eq(nfcTags.id, input.tagId)).limit(1);
      if (!current) return "not-found" as const;
      if (current.status === "retired" || current.status === "suspended") return "invalid-state" as const;
      const [destination] = await transaction.select({ id: pets.id }).from(pets).where(and(eq(pets.id, input.destinationPetId), eq(pets.accountId, input.destinationAccountId))).limit(1);
      if (!destination) return "invalid-destination" as const;
      const [updated] = await transaction.update(nfcTags).set({ accountId: input.destinationAccountId, petId: input.destinationPetId, status: "active", updatedAt: new Date() }).where(and(eq(nfcTags.id, input.tagId), eq(nfcTags.status, current.status))).returning();
      if (!updated) return "invalid-state" as const;
      await transaction.insert(nfcTagStatusHistory).values({ tagId: updated.id, previousStatus: current.status, newStatus: "active", reasonCode: input.reasonCode, reason: input.reason ?? null, changedByAccountId: actorAccountId });
      await transaction.insert(auditLogs).values({ accountId: actorAccountId, action: "admin.tag.reassigned", targetType: "nfc_tag", targetId: updated.id, result: "success", metadata: { reasonCode: input.reasonCode, previousAccountId: current.accountId ?? "none", previousPetId: current.petId ?? "none" } });
      return recordFromTag(updated);
    });
  }
}
