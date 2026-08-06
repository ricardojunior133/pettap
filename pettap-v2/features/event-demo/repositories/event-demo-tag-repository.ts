import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { eventDemoTags } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { CreateEventDemoTagInput } from "../schemas/event-demo";

export type EventDemoTagRecord = typeof eventDemoTags.$inferSelect;

export class EventDemoTagRepository {
  async create(input: CreateEventDemoTagInput & { publicCode: string }): Promise<EventDemoTagRecord> {
    const database = createDatabaseClient();
    const [record] = await database.insert(eventDemoTags).values(input).returning();
    return record;
  }

  async findById(id: string): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(eventDemoTags).where(eq(eventDemoTags.id, id)).limit(1);
    return record ?? null;
  }

  async findByPublicCode(publicCode: string): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(eventDemoTags).where(eq(eventDemoTags.publicCode, publicCode)).limit(1);
    return record ?? null;
  }

  async list(): Promise<EventDemoTagRecord[]> {
    const database = createDatabaseClient();
    return database.select().from(eventDemoTags).orderBy(desc(eventDemoTags.createdAt));
  }

  async listPage(input: { page: number; pageSize: number; status?: EventDemoTagRecord["status"]; enabled?: boolean; attentionOnly?: boolean }): Promise<{ rows: EventDemoTagRecord[]; total: number }> {
    const database = createDatabaseClient();
    const predicates = [
      input.status ? eq(eventDemoTags.status, input.status) : undefined,
      typeof input.enabled === "boolean" ? eq(eventDemoTags.isEnabled, input.enabled) : undefined,
      input.attentionOnly ? sql`${eventDemoTags.status} = 'expired'` : undefined,
    ].filter((value): value is NonNullable<typeof value> => Boolean(value));
    const where = predicates.length ? and(...predicates) : undefined;
    const [totalRow] = await database.select({ count: sql<number>`count(*)::int` }).from(eventDemoTags).where(where);
    const total = totalRow?.count ?? 0; const page = Math.min(Math.max(1, input.page), Math.max(1, Math.ceil(total / input.pageSize)));
    const rows = await database.select().from(eventDemoTags).where(where).orderBy(sql`case when ${eventDemoTags.status} = 'expired' then 0 else 1 end`, desc(eventDemoTags.lastUsedAt), desc(eventDemoTags.createdAt)).limit(input.pageSize).offset((page - 1) * input.pageSize);
    return { rows, total };
  }

  async updateStatus(id: string, status: EventDemoTagRecord["status"]): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoTags).set({ status, updatedAt: new Date() }).where(eq(eventDemoTags.id, id)).returning();
    return record ?? null;
  }

  async incrementUsage(id: string): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoTags).set({ usageCount: sql`${eventDemoTags.usageCount} + 1`, lastUsedAt: new Date(), updatedAt: new Date() }).where(eq(eventDemoTags.id, id)).returning();
    return record ?? null;
  }

  async updateLastReset(id: string): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoTags).set({ lastResetAt: new Date(), updatedAt: new Date() }).where(eq(eventDemoTags.id, id)).returning();
    return record ?? null;
  }

  async resetToAvailable(id: string, now = new Date()): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      await transaction.execute(sql`select id from event_demo_tags where id = ${id} for update`);
      const [record] = await transaction.update(eventDemoTags).set({ status: "available", isEnabled: true, lastResetAt: now, updatedAt: now }).where(eq(eventDemoTags.id, id)).returning();
      return record ?? null;
    });
  }

  async enable(id: string): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoTags).set({ isEnabled: true, status: "available", updatedAt: new Date() }).where(eq(eventDemoTags.id, id)).returning();
    return record ?? null;
  }

  async disable(id: string): Promise<EventDemoTagRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoTags).set({ isEnabled: false, status: "disabled", updatedAt: new Date() }).where(and(eq(eventDemoTags.id, id), eq(eventDemoTags.isEnabled, true))).returning();
    return record ?? null;
  }
}
