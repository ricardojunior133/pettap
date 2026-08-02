import "server-only";

import { and, count, desc, eq, ilike, isNull, type SQL } from "drizzle-orm";

import { nfcTags, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type AdminNfcTagStatus = "unassigned" | "active" | "suspended" | "lost" | "retired";

export type AdminNfcTagListInput = {
  page: number;
  pageSize: number;
  publicCode?: string;
  status?: AdminNfcTagStatus;
  unassignedOnly: boolean;
  withoutPet: boolean;
};

export type AdminNfcTagRecord = {
  publicCode: string;
  status: AdminNfcTagStatus;
  accountId: string | null;
  petName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminNfcTagPage = { rows: AdminNfcTagRecord[]; total: number };

export interface AdminNfcTagRepository {
  list(input: AdminNfcTagListInput): Promise<AdminNfcTagPage>;
}

function whereFor(input: AdminNfcTagListInput): SQL | undefined {
  const conditions: SQL[] = [];
  if (input.publicCode) conditions.push(ilike(nfcTags.publicId, `%${input.publicCode}%`));
  if (input.status) conditions.push(eq(nfcTags.status, input.status));
  if (input.unassignedOnly) conditions.push(eq(nfcTags.status, "unassigned"));
  if (input.withoutPet) conditions.push(isNull(nfcTags.petId));
  return conditions.length ? and(...conditions) : undefined;
}

/** Deliberately allowlisted administrative read model: no credentials, contact data or internal IDs leave this repository. */
export class DrizzleAdminNfcTagRepository implements AdminNfcTagRepository {
  async list(input: AdminNfcTagListInput): Promise<AdminNfcTagPage> {
    const database = createDatabaseClient();
    const where = whereFor(input);
    const base = database
      .select({
        publicCode: nfcTags.publicId,
        status: nfcTags.status,
        accountId: nfcTags.accountId,
        petName: pets.name,
        createdAt: nfcTags.createdAt,
        updatedAt: nfcTags.updatedAt,
      })
      .from(nfcTags)
      .leftJoin(pets, eq(nfcTags.petId, pets.id));
    const countBase = database.select({ value: count() }).from(nfcTags);
    const [rows, totalResult] = await Promise.all([
      (where ? base.where(where) : base)
        .orderBy(desc(nfcTags.updatedAt), desc(nfcTags.publicId))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize),
      where ? countBase.where(where) : countBase,
    ]);
    return {
      rows: rows.map((row) => ({ ...row, status: row.status as AdminNfcTagStatus })),
      total: Number(totalResult[0]?.value ?? 0),
    };
  }
}
