import "server-only";

import { and, count, desc, eq, sql } from "drizzle-orm";

import { nfcTags, pets, tagActivations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type OwnedTagFoundationRecord = {
  id: string;
  publicId: string;
  status: "unassigned" | "active" | "suspended" | "lost" | "retired";
  createdAt: Date;
  pet: { id: string; publicId: string; name: string; archivedAt: Date | null; publicProfileEnabled: boolean } | null;
  activatedAt: Date | null;
};

export type CustomerTagFoundationPage = { rows: OwnedTagFoundationRecord[]; total: number };
export type CustomerTagFoundationPagination = { page: number; pageSize: number };

export interface CustomerTagFoundationRepository {
  listOwnedTags(accountId: string, pagination: CustomerTagFoundationPagination): Promise<CustomerTagFoundationPage>;
  findOwnedTagByPublicId(accountId: string, publicId: string): Promise<OwnedTagFoundationRecord | null>;
  findTagAssociation(accountId: string, publicId: string): Promise<OwnedTagFoundationRecord | null>;
  findLatestActivationForOwnedTag(accountId: string, publicId: string): Promise<Date | null>;
}

const selection = {
  id: nfcTags.id,
  publicId: nfcTags.publicId,
  status: nfcTags.status,
  createdAt: nfcTags.createdAt,
  petId: pets.id,
  petPublicId: pets.publicId,
  petName: pets.name,
  petArchivedAt: pets.archivedAt,
  petPublicProfileEnabled: pets.publicProfileEnabled,
};

type OwnedTagRow = {
  id: string;
  publicId: string;
  status: OwnedTagFoundationRecord["status"];
  createdAt: Date;
  petId: string | null;
  petPublicId: string | null;
  petName: string | null;
  petArchivedAt: Date | null;
  petPublicProfileEnabled: boolean | null;
  activatedAt: Date | null;
};

function map(row: OwnedTagRow): OwnedTagFoundationRecord {
  return {
    id: row.id,
    publicId: row.publicId,
    status: row.status,
    createdAt: row.createdAt,
    pet: row.petId && row.petPublicId && row.petName && row.petPublicProfileEnabled !== null ? { id: row.petId, publicId: row.petPublicId, name: row.petName, archivedAt: row.petArchivedAt, publicProfileEnabled: row.petPublicProfileEnabled } : null,
    activatedAt: row.activatedAt,
  };
}

export class DrizzleCustomerTagFoundationRepository implements CustomerTagFoundationRepository {
  async listOwnedTags(accountId: string, { page, pageSize }: CustomerTagFoundationPagination) {
    const database = createDatabaseClient();
    const where = eq(nfcTags.accountId, accountId);
    const activatedAt = sql<Date | null>`(select max(${tagActivations.createdAt}) from ${tagActivations} where ${tagActivations.tagId} = ${nfcTags.id} and ${tagActivations.accountId} = ${accountId})`;
    const [rows, totalResult] = await Promise.all([
      database.select({ ...selection, activatedAt }).from(nfcTags).leftJoin(pets, eq(nfcTags.petId, pets.id)).where(where)
        .orderBy(desc(nfcTags.updatedAt), desc(nfcTags.publicId)).limit(pageSize).offset((page - 1) * pageSize),
      database.select({ value: count() }).from(nfcTags).where(where),
    ]);
    return { rows: rows.map(map), total: Number(totalResult[0]?.value ?? 0) };
  }

  async findOwnedTagByPublicId(accountId: string, publicId: string) {
    const database = createDatabaseClient();
    const activatedAt = sql<Date | null>`(select max(${tagActivations.createdAt}) from ${tagActivations} where ${tagActivations.tagId} = ${nfcTags.id} and ${tagActivations.accountId} = ${accountId})`;
    const [row] = await database.select({ ...selection, activatedAt }).from(nfcTags).leftJoin(pets, eq(nfcTags.petId, pets.id))
      .where(and(eq(nfcTags.accountId, accountId), eq(nfcTags.publicId, publicId))).limit(1);
    return row ? map(row) : null;
  }

  async findTagAssociation(accountId: string, publicId: string) {
    return this.findOwnedTagByPublicId(accountId, publicId);
  }

  async findLatestActivationForOwnedTag(accountId: string, publicId: string) {
    const tag = await this.findOwnedTagByPublicId(accountId, publicId);
    return tag?.activatedAt ?? null;
  }
}
