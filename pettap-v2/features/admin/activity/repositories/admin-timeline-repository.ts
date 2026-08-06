import "server-only";

import { and, desc, eq, lt } from "drizzle-orm";

import { activityLogs, lostReports, nfcTagStatusHistory, nfcTags, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { AdminTimelineItemViewModel } from "../../types/operations";

export interface AdminTimelineRepository {
  listForAccount(accountId: string, before: Date | null, limit: number): Promise<AdminTimelineItemViewModel[]>;
  listForPet(petId: string, before: Date | null, limit: number): Promise<AdminTimelineItemViewModel[]>;
  listForTag(tagId: string, before: Date | null, limit: number): Promise<AdminTimelineItemViewModel[]>;
}

function newest(items: AdminTimelineItemViewModel[], limit: number) {
  return items.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)).slice(0, limit);
}

export class DrizzleAdminTimelineRepository implements AdminTimelineRepository {
  async listForAccount(accountId: string, before: Date | null, limit: number): Promise<AdminTimelineItemViewModel[]> {
    const database = createDatabaseClient();
    const timeCondition = before ? lt(activityLogs.createdAt, before) : undefined;
    const [activities, lost, tagHistory] = await Promise.all([
      database.select({ id: activityLogs.id, createdAt: activityLogs.createdAt }).from(activityLogs).where(and(eq(activityLogs.accountId, accountId), timeCondition)).orderBy(desc(activityLogs.createdAt)).limit(limit),
      database.select({ id: lostReports.id, createdAt: lostReports.createdAt, status: lostReports.status, petName: pets.name }).from(lostReports).innerJoin(pets, eq(lostReports.petId, pets.id)).where(and(eq(pets.accountId, accountId), before ? lt(lostReports.createdAt, before) : undefined)).orderBy(desc(lostReports.createdAt)).limit(limit),
      database.select({ id: nfcTagStatusHistory.id, createdAt: nfcTagStatusHistory.createdAt, newStatus: nfcTagStatusHistory.newStatus, publicId: nfcTags.publicId, reasonCode: nfcTagStatusHistory.reasonCode }).from(nfcTagStatusHistory).innerJoin(nfcTags, eq(nfcTagStatusHistory.tagId, nfcTags.id)).where(and(eq(nfcTags.accountId, accountId), before ? lt(nfcTagStatusHistory.createdAt, before) : undefined)).orderBy(desc(nfcTagStatusHistory.createdAt)).limit(limit),
    ]);
    return newest([
      ...activities.map((item) => ({ id: `activity-${item.id}`, occurredAt: item.createdAt.toISOString(), source: "activity" as const, title: "Account activity recorded", detail: null })),
      ...lost.map((item) => ({ id: `lost-${item.id}`, occurredAt: item.createdAt.toISOString(), source: "lost_mode" as const, title: `Lost Mode ${item.status === "active" ? "enabled" : "updated"}`, detail: item.petName })),
      ...tagHistory.map((item) => ({ id: `tag-${item.id}`, occurredAt: item.createdAt.toISOString(), source: "tag" as const, title: `Tag status changed to ${item.newStatus}`, detail: item.publicId })),
    ], limit);
  }

  async listForPet(petId: string, before: Date | null, limit: number): Promise<AdminTimelineItemViewModel[]> {
    const database = createDatabaseClient();
    const [lost, tagHistory] = await Promise.all([
      database.select({ id: lostReports.id, createdAt: lostReports.createdAt, status: lostReports.status }).from(lostReports).where(and(eq(lostReports.petId, petId), before ? lt(lostReports.createdAt, before) : undefined)).orderBy(desc(lostReports.createdAt)).limit(limit),
      database.select({ id: nfcTagStatusHistory.id, createdAt: nfcTagStatusHistory.createdAt, newStatus: nfcTagStatusHistory.newStatus, publicId: nfcTags.publicId }).from(nfcTagStatusHistory).innerJoin(nfcTags, eq(nfcTagStatusHistory.tagId, nfcTags.id)).where(and(eq(nfcTags.petId, petId), before ? lt(nfcTagStatusHistory.createdAt, before) : undefined)).orderBy(desc(nfcTagStatusHistory.createdAt)).limit(limit),
    ]);
    return newest([
      ...lost.map((item) => ({ id: `lost-${item.id}`, occurredAt: item.createdAt.toISOString(), source: "lost_mode" as const, title: `Lost Mode ${item.status === "active" ? "enabled" : "updated"}`, detail: null })),
      ...tagHistory.map((item) => ({ id: `tag-${item.id}`, occurredAt: item.createdAt.toISOString(), source: "tag" as const, title: `Tag status changed to ${item.newStatus}`, detail: item.publicId })),
    ], limit);
  }

  async listForTag(tagId: string, before: Date | null, limit: number): Promise<AdminTimelineItemViewModel[]> {
    const database = createDatabaseClient();
    const rows = await database.select({ id: nfcTagStatusHistory.id, createdAt: nfcTagStatusHistory.createdAt, newStatus: nfcTagStatusHistory.newStatus, reasonCode: nfcTagStatusHistory.reasonCode }).from(nfcTagStatusHistory).where(and(eq(nfcTagStatusHistory.tagId, tagId), before ? lt(nfcTagStatusHistory.createdAt, before) : undefined)).orderBy(desc(nfcTagStatusHistory.createdAt)).limit(limit);
    return rows.map((item) => ({ id: `tag-${item.id}`, occurredAt: item.createdAt.toISOString(), source: "tag", title: `Tag status changed to ${item.newStatus}`, detail: item.reasonCode }));
  }
}
