import "server-only";

import { and, desc, eq, ilike, sql } from "drizzle-orm";

import { leads } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { LeadInput } from "../schemas/event-demo";

export type LeadRecord = typeof leads.$inferSelect;

export class LeadRepository {
  async findByNormalisedEmail(email: string): Promise<LeadRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(leads).where(eq(leads.email, email)).limit(1);
    return record ?? null;
  }

  async create(input: LeadInput & { consentedAt: Date | null }): Promise<LeadRecord> {
    const database = createDatabaseClient();
    const [record] = await database.insert(leads).values(input).returning();
    return record;
  }

  async updateConsent(id: string, input: Pick<LeadInput, "marketingConsent" | "consentVersion"> & { consentedAt: Date | null }): Promise<LeadRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(leads).set({ ...input, updatedAt: new Date() }).where(eq(leads.id, id)).returning();
    return record ?? null;
  }

  async upsertByEmail(input: LeadInput & { consentedAt: Date | null }): Promise<LeadRecord> {
    const database = createDatabaseClient();
    const [record] = await database.insert(leads).values(input).onConflictDoUpdate({ target: leads.email, set: { firstName: input.firstName, source: input.source, marketingConsent: input.marketingConsent, consentVersion: input.consentVersion, consentedAt: input.consentedAt, updatedAt: new Date() } }).returning();
    return record;
  }

  async listConsented(input: { page: number; pageSize: number; search?: string; source?: LeadRecord["source"]; since?: Date }): Promise<{ rows: LeadRecord[]; total: number }> {
    const database = createDatabaseClient();
    const predicates = [eq(leads.marketingConsent, true), input.search ? ilike(leads.email, `%${input.search.replace(/[\\%_]/g, "\\$&")}%`) : undefined, input.source ? eq(leads.source, input.source) : undefined, input.since ? sql`${leads.consentedAt} >= ${input.since}` : undefined].filter((value): value is NonNullable<typeof value> => Boolean(value));

    const where = and(...predicates);
    const [totalRow] = await database.select({ count: sql<number>`count(*)::int` }).from(leads).where(where);
    const total = totalRow?.count ?? 0; const page = Math.min(Math.max(1, input.page), Math.max(1, Math.ceil(total / input.pageSize)));
    const rows = await database.select().from(leads).where(where).orderBy(desc(leads.consentedAt), desc(leads.createdAt)).limit(input.pageSize).offset((page - 1) * input.pageSize);
    return { rows, total };
  }

  async findConsentedByEmail(email: string): Promise<LeadRecord | null> {
    const database = createDatabaseClient();
    const [lead] = await database.select().from(leads).where(and(eq(leads.email, email), eq(leads.marketingConsent, true))).limit(1);
    return lead ?? null;
  }
}
