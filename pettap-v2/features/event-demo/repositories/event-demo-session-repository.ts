import "server-only";

import { and, desc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { auditLogs, eventDemoSessions, eventDemoTags } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type EventDemoSessionRecord = typeof eventDemoSessions.$inferSelect;
export type CreateEventDemoSessionRecord = Pick<typeof eventDemoSessions.$inferInsert, "publicId" | "demoTagId" | "sessionTokenHash" | "expiresAt">;
export type EventDemoSessionUpdate = Partial<Omit<typeof eventDemoSessions.$inferInsert, "id" | "publicId" | "demoTagId" | "sessionTokenHash" | "createdAt">>;

export type StartSessionResult =
  | { kind: "started"; session: EventDemoSessionRecord }
  | { kind: "tag_not_found" | "tag_disabled" | "tag_unavailable" }
  | { kind: "expired_session_requires_cleanup"; sessionId: string };

const piiClearance = {
  petName: null,
  species: null,
  breed: null,
  age: null,
  personality: null,
  ownerFirstName: null,
  contactTelephone: null,
  contactEmail: null,
  showOwnerFirstName: false,
  showTelephone: false,
  showEmail: false,
  showBreed: false,
  showAge: false,
  showPersonality: false,
  demoConsentAccepted: false,
  demoConsentVersion: null,
  demoConsentAcceptedAt: null,
  marketingConsent: false,
  marketingConsentVersion: null,
  marketingConsentAt: null,
};

export class EventDemoSessionRepository {
  async create(input: CreateEventDemoSessionRecord): Promise<EventDemoSessionRecord> {
    const database = createDatabaseClient();
    const [record] = await database.insert(eventDemoSessions).values(input).returning();
    return record;
  }

  /** Locks the tag row, preventing concurrent NFC taps from creating two valid sessions. */
  async startForTag(input: { demoTagId: string; publicId: string; sessionTokenHash: string; now: Date }): Promise<StartSessionResult> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      await transaction.execute(sql`select id from event_demo_tags where id = ${input.demoTagId} for update`);
      const [tag] = await transaction.select().from(eventDemoTags).where(eq(eventDemoTags.id, input.demoTagId)).limit(1);
      if (!tag) return { kind: "tag_not_found" };
      if (!tag.isEnabled || tag.status === "disabled") return { kind: "tag_disabled" };
      if (!["available", "completed", "expired"].includes(tag.status)) return { kind: "tag_unavailable" };

      const [active] = await transaction.select().from(eventDemoSessions)
        .where(and(eq(eventDemoSessions.demoTagId, tag.id), inArray(eventDemoSessions.status, ["started", "profile_created", "completed"]), isNull(eventDemoSessions.deletedAt)))
        .orderBy(desc(eventDemoSessions.createdAt)).limit(1);
      if (active && active.expiresAt > input.now) return { kind: "tag_unavailable" };
      if (active) {
        await transaction.update(eventDemoSessions).set({ status: "expired", updatedAt: input.now }).where(eq(eventDemoSessions.id, active.id));
        await transaction.update(eventDemoTags).set({ status: "expired", updatedAt: input.now }).where(eq(eventDemoTags.id, tag.id));
        await transaction.insert(auditLogs).values({ accountId: null, action: "event_demo.session_expired", targetType: "event_demo_session", targetId: active.id, result: "success", metadata: { demoTagId: tag.id, sessionId: active.id, status: "expired" } });
        return { kind: "expired_session_requires_cleanup", sessionId: active.id };
      }

      const expiresAt = new Date(input.now.getTime() + tag.sessionDurationMinutes * 60_000);
      const [session] = await transaction.insert(eventDemoSessions).values({ publicId: input.publicId, demoTagId: tag.id, sessionTokenHash: input.sessionTokenHash, expiresAt }).returning();
      await transaction.update(eventDemoTags).set({ status: "in_progress", usageCount: sql`${eventDemoTags.usageCount} + 1`, lastUsedAt: input.now, updatedAt: input.now }).where(eq(eventDemoTags.id, tag.id));
      await transaction.insert(auditLogs).values({ accountId: null, action: "event_demo.session_started", targetType: "event_demo_session", targetId: session.id, result: "success", metadata: { demoTagId: tag.id, sessionId: session.id, status: "started" } });
      return { kind: "started", session };
    });
  }

  async findById(id: string): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(eventDemoSessions).where(eq(eventDemoSessions.id, id)).limit(1);
    return record ?? null;
  }

  async findByPublicId(publicId: string): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(eventDemoSessions).where(eq(eventDemoSessions.publicId, publicId)).limit(1);
    return record ?? null;
  }

  async findActiveByTagId(demoTagId: string, now = new Date()): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(eventDemoSessions).where(and(eq(eventDemoSessions.demoTagId, demoTagId), inArray(eventDemoSessions.status, ["started", "profile_created"]), gt(eventDemoSessions.expiresAt, now), isNull(eventDemoSessions.deletedAt))).limit(1);
    return record ?? null;
  }

  async findLatestByTagId(demoTagId: string): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.select().from(eventDemoSessions).where(eq(eventDemoSessions.demoTagId, demoTagId)).orderBy(desc(eventDemoSessions.createdAt)).limit(1);
    return record ?? null;
  }

  async update(id: string, input: EventDemoSessionUpdate): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoSessions).set({ ...input, updatedAt: new Date() }).where(eq(eventDemoSessions.id, id)).returning();
    return record ?? null;
  }

  async markExpired(id: string): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoSessions).set({ status: "expired", updatedAt: new Date() }).where(and(eq(eventDemoSessions.id, id), or(eq(eventDemoSessions.status, "started"), eq(eventDemoSessions.status, "profile_created")))).returning();
    return record ?? null;
  }

  async expireWithTag(id: string, now = new Date()): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [session] = await transaction.select().from(eventDemoSessions).where(eq(eventDemoSessions.id, id)).limit(1);
      if (!session || session.status === "deleted") return null;
      if (session.status === "expired") return session;
      const [updated] = await transaction.update(eventDemoSessions).set({ status: "expired", updatedAt: now }).where(eq(eventDemoSessions.id, id)).returning();
      await transaction.update(eventDemoTags).set({ status: "expired", updatedAt: now }).where(and(eq(eventDemoTags.id, session.demoTagId), eq(eventDemoTags.status, "in_progress")));
      await transaction.insert(auditLogs).values({ accountId: null, action: "event_demo.session_expired", targetType: "event_demo_session", targetId: id, result: "success", metadata: { demoTagId: session.demoTagId, sessionId: id, status: "expired" } });
      return updated;
    });
  }

  async completeWithTag(id: string, now = new Date()): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [session] = await transaction.select().from(eventDemoSessions).where(eq(eventDemoSessions.id, id)).limit(1);
      if (!session || session.status !== "profile_created") return null;
      const [updated] = await transaction.update(eventDemoSessions).set({ status: "completed", completedAt: now, updatedAt: now }).where(eq(eventDemoSessions.id, id)).returning();
      await transaction.update(eventDemoTags).set({ status: "completed", updatedAt: now }).where(and(eq(eventDemoTags.id, session.demoTagId), eq(eventDemoTags.status, "in_progress")));
      return updated;
    });
  }

  async markDeleted(id: string): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    const [record] = await database.update(eventDemoSessions).set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() }).where(eq(eventDemoSessions.id, id)).returning();
    return record ?? null;
  }

  /** Clears PII only after Storage deletion succeeded, then makes the tag available atomically. */
  async finalizeCleanup(id: string, now = new Date()): Promise<EventDemoSessionRecord | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [session] = await transaction.select().from(eventDemoSessions).where(eq(eventDemoSessions.id, id)).limit(1);
      if (!session) return null;
      if (session.status === "deleted") return session;
      const [updated] = await transaction.update(eventDemoSessions).set({ ...piiClearance, photoStoragePath: null, status: "deleted", deletedAt: now, updatedAt: now }).where(eq(eventDemoSessions.id, id)).returning();
      const [tag] = await transaction.select({ status: eventDemoTags.status }).from(eventDemoTags).where(eq(eventDemoTags.id, session.demoTagId)).limit(1);
      if (tag) await transaction.update(eventDemoTags).set({ status: tag.status === "disabled" ? "disabled" : "available", lastResetAt: now, updatedAt: now }).where(eq(eventDemoTags.id, session.demoTagId));
      return updated;
    });
  }

  async listExpiredCandidates(now = new Date()): Promise<EventDemoSessionRecord[]> {
    const database = createDatabaseClient();
    return database.select().from(eventDemoSessions).where(and(lt(eventDemoSessions.expiresAt, now), or(eq(eventDemoSessions.status, "started"), eq(eventDemoSessions.status, "profile_created")), isNull(eventDemoSessions.deletedAt)));
  }

  async listRecent(input: { page: number; pageSize: number; status?: EventDemoSessionRecord["status"]; tagId?: string; since?: Date }): Promise<{ rows: EventDemoSessionRecord[]; total: number }> {
    const database = createDatabaseClient();
    const predicates = [input.status ? eq(eventDemoSessions.status, input.status) : undefined, input.tagId ? eq(eventDemoSessions.demoTagId, input.tagId) : undefined, input.since ? gt(eventDemoSessions.createdAt, input.since) : undefined].filter((value): value is NonNullable<typeof value> => Boolean(value));
    const where = predicates.length ? and(...predicates) : undefined;
    const [totalRow] = await database.select({ count: sql<number>`count(*)::int` }).from(eventDemoSessions).where(where);
    const total = totalRow?.count ?? 0; const page = Math.min(Math.max(1, input.page), Math.max(1, Math.ceil(total / input.pageSize)));
    const rows = await database.select().from(eventDemoSessions).where(where).orderBy(desc(eventDemoSessions.createdAt)).limit(input.pageSize).offset((page - 1) * input.pageSize);
    return { rows, total };
  }
}
