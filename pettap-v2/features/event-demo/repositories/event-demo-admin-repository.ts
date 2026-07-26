import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { auditLogs, eventDemoSessions, eventDemoTags } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type EventDemoMetricsSnapshot = {
  totalTags: number; available: number; inProgress: number; completed: number; expired: number; disabled: number;
  sessionsStartedToday: number; profilesCompletedToday: number; profilesViewedToday: number; leadsConsentedToday: number;
  startedTotal: number; cleanupRequired: number; cleanupFailures: number; resets: number; cancellations: number;
};

export class EventDemoAdminRepository {
  async getMetrics(): Promise<EventDemoMetricsSnapshot> {
    const database = createDatabaseClient();
    const [tagRows, sessionRows, auditRows] = await Promise.all([
      database.execute(sql`
        select count(*)::int as total_tags,
          count(*) filter (where status = 'available')::int as available,
          count(*) filter (where status = 'in_progress')::int as in_progress,
          count(*) filter (where status = 'completed')::int as completed,
          count(*) filter (where status = 'expired')::int as expired,
          count(*) filter (where status = 'disabled')::int as disabled
        from ${eventDemoTags}`),
      database.execute(sql`
        select count(*) filter (where created_at >= date_trunc('day', now()))::int as sessions_started_today,
          count(*) filter (where status = 'completed' and completed_at >= date_trunc('day', now()))::int as profiles_completed_today,
          count(*)::int as started_total,
          count(*) filter (where status in ('expired', 'started', 'profile_created') and deleted_at is null and expires_at <= now())::int as cleanup_required,
          count(*) filter (where status = 'expired' and deleted_at is null)::int as expired_pending
        from ${eventDemoSessions}`),
      database.execute(sql`
        select count(*) filter (where action = 'event_demo.profile_viewed' and created_at >= date_trunc('day', now()))::int as profiles_viewed_today,
          count(*) filter (where action = 'event_demo.lead_created' and created_at >= date_trunc('day', now()))::int as leads_consented_today,
          count(*) filter (where action = 'event_demo.tag_reset')::int as resets,
          count(*) filter (where action = 'event_demo.error' and result = 'failed')::int as cleanup_failures,
          count(*) filter (where action = 'event_demo.session_expired')::int as cancellations
        from ${auditLogs}`),
    ]);
    const first = (rows: Iterable<Record<string, unknown>>) => Array.from(rows)[0] ?? {};
    const number = (value: unknown) => Number(value ?? 0);
    const tags = first(tagRows); const sessions = first(sessionRows); const audit = first(auditRows);
    return {
      totalTags: number(tags.total_tags), available: number(tags.available), inProgress: number(tags.in_progress), completed: number(tags.completed), expired: number(tags.expired), disabled: number(tags.disabled),
      sessionsStartedToday: number(sessions.sessions_started_today), profilesCompletedToday: number(sessions.profiles_completed_today), profilesViewedToday: number(audit.profiles_viewed_today), leadsConsentedToday: number(audit.leads_consented_today),
      startedTotal: number(sessions.started_total), cleanupRequired: number(sessions.cleanup_required), cleanupFailures: number(audit.cleanup_failures), resets: number(audit.resets), cancellations: number(audit.cancellations),
    };
  }

  async latestSessionsByTagIds(tagIds: string[]) {
    if (!tagIds.length) return new Map<string, { publicId: string; status: string; createdAt: Date; expiresAt: Date; completedAt: Date | null; deletedAt: Date | null; photoStoragePath: string | null; marketingConsent: boolean }>();
    const database = createDatabaseClient();
    const rows = await database.select().from(eventDemoSessions).where(inArray(eventDemoSessions.demoTagId, tagIds)).orderBy(desc(eventDemoSessions.createdAt));
    const result = new Map<string, typeof rows[number]>();
    for (const row of rows) if (!result.has(row.demoTagId)) result.set(row.demoTagId, row);
    return result;
  }

  async hasActiveSession(tagId: string, now = new Date()): Promise<boolean> {
    const database = createDatabaseClient();
    const [row] = await database.select({ id: eventDemoSessions.id }).from(eventDemoSessions).where(and(eq(eventDemoSessions.demoTagId, tagId), inArray(eventDemoSessions.status, ["started", "profile_created"]), sql`${eventDemoSessions.expiresAt} > ${now}`, sql`${eventDemoSessions.deletedAt} is null`)).limit(1);
    return Boolean(row);
  }
}
