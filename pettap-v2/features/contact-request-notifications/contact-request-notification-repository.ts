import "server-only";

import { and, asc, eq, inArray, lte, or, sql } from "drizzle-orm";

import { auditLogs, contactRequestNotifications, contactRequests, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";
import { PROCESSING_LEASE_DURATION_MS, type ContactRequestNotificationStatus, type ContactRequestNotificationType } from "./types";

export type ContactRequestNotificationRecord = {
  id: string;
  contactRequestId: string;
  type: ContactRequestNotificationType;
  status: ContactRequestNotificationStatus;
  recipientEmail: string;
  attemptCount: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  failedAt: Date | null;
  nextRetryAt: Date | null;
  provider: string;
  providerMessageId: string | null;
  safeErrorCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ContactRequestDeliveryContext = {
  contactRequestId: string;
  ownerAccountId: string;
  petName: string | null;
  finderName: string;
  finderContact: string;
  message: string;
};

export type ContactNotificationAudit = {
  action: "contact.notification.queued" | "contact.notification.processing" | "contact.notification.sent" | "contact.notification.failed" | "contact.notification.cancelled" | "contact.notification.retry_scheduled";
  contactRequestId: string;
  notificationId: string | null;
  accountId: string | null;
  attemptCount?: number;
  provider?: string;
  safeErrorCode?: string;
};

const rowColumns = {
  id: contactRequestNotifications.id,
  contactRequestId: contactRequestNotifications.contactRequestId,
  type: contactRequestNotifications.type,
  status: contactRequestNotifications.status,
  recipientEmail: contactRequestNotifications.recipientEmail,
  attemptCount: contactRequestNotifications.attemptCount,
  lastAttemptAt: contactRequestNotifications.lastAttemptAt,
  sentAt: contactRequestNotifications.sentAt,
  failedAt: contactRequestNotifications.failedAt,
  nextRetryAt: contactRequestNotifications.nextRetryAt,
  provider: contactRequestNotifications.provider,
  providerMessageId: contactRequestNotifications.providerMessageId,
  safeErrorCode: contactRequestNotifications.safeErrorCode,
  createdAt: contactRequestNotifications.createdAt,
  updatedAt: contactRequestNotifications.updatedAt,
};

function toRecord(row: typeof contactRequestNotifications.$inferSelect | ContactRequestNotificationRecord): ContactRequestNotificationRecord {
  return { ...row, type: row.type as ContactRequestNotificationType, status: row.status as ContactRequestNotificationStatus };
}

export interface ContactRequestNotificationRepository {
  enqueue(input: { contactRequestId: string; type: ContactRequestNotificationType; recipientEmail: string; provider: string }): Promise<ContactRequestNotificationRecord | null>;
  findPendingForProcessing(now: Date, limit: number): Promise<ContactRequestNotificationRecord[]>;
  /** Atomically claims pending, due-retry, or lease-expired processing work. */
  markProcessing(id: string, now: Date, processingLeaseExpiredBefore: Date): Promise<ContactRequestNotificationRecord | null>;
  markSent(id: string, providerMessageId: string | null, now: Date): Promise<boolean>;
  markFailed(id: string, safeErrorCode: string, now: Date): Promise<boolean>;
  scheduleRetry(id: string, safeErrorCode: string, retryAt: Date, now: Date): Promise<boolean>;
  cancel(id: string, now: Date): Promise<boolean>;
  findByContactRequest(contactRequestId: string, type: ContactRequestNotificationType): Promise<ContactRequestNotificationRecord | null>;
  getDeliveryContext(contactRequestId: string): Promise<ContactRequestDeliveryContext | null>;
  recordAudit(event: ContactNotificationAudit): Promise<void>;
}

/** Database access is isolated here; services never create a database client. */
export class DrizzleContactRequestNotificationRepository implements ContactRequestNotificationRepository {
  async enqueue(input: { contactRequestId: string; type: ContactRequestNotificationType; recipientEmail: string; provider: string }) {
    const db = createDatabaseClient();
    const [row] = await db.insert(contactRequestNotifications).values({ ...input, status: "pending", attemptCount: 0 }).onConflictDoNothing({ target: [contactRequestNotifications.contactRequestId, contactRequestNotifications.type] }).returning();
    return row ? toRecord(row) : null;
  }

  async findPendingForProcessing(now: Date, limit: number) {
    const db = createDatabaseClient();
    const processingLeaseExpiredBefore = new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS);
    const rows = await db.select(rowColumns).from(contactRequestNotifications).where(or(
      eq(contactRequestNotifications.status, "pending"),
      and(eq(contactRequestNotifications.status, "failed"), lte(contactRequestNotifications.nextRetryAt, now)),
      and(eq(contactRequestNotifications.status, "processing"), lte(contactRequestNotifications.updatedAt, processingLeaseExpiredBefore)),
    )).orderBy(asc(contactRequestNotifications.createdAt), asc(contactRequestNotifications.id)).limit(limit);
    return rows.map(toRecord);
  }

  async markProcessing(id: string, now: Date, processingLeaseExpiredBefore: Date) {
    const db = createDatabaseClient();
    const [row] = await db.update(contactRequestNotifications).set({ status: "processing", attemptCount: sql`${contactRequestNotifications.attemptCount} + 1`, lastAttemptAt: now, updatedAt: now, nextRetryAt: null }).where(and(
      eq(contactRequestNotifications.id, id),
      or(
        eq(contactRequestNotifications.status, "pending"),
        and(eq(contactRequestNotifications.status, "failed"), lte(contactRequestNotifications.nextRetryAt, now)),
        and(eq(contactRequestNotifications.status, "processing"), lte(contactRequestNotifications.updatedAt, processingLeaseExpiredBefore)),
      ),
    )).returning();
    return row ? toRecord(row) : null;
  }

  async markSent(id: string, providerMessageId: string | null, now: Date) { const db = createDatabaseClient(); const rows = await db.update(contactRequestNotifications).set({ status: "sent", providerMessageId, sentAt: now, failedAt: null, safeErrorCode: null, updatedAt: now }).where(and(eq(contactRequestNotifications.id, id), eq(contactRequestNotifications.status, "processing"))).returning({ id: contactRequestNotifications.id }); return rows.length === 1; }
  async markFailed(id: string, safeErrorCode: string, now: Date) { const db = createDatabaseClient(); const rows = await db.update(contactRequestNotifications).set({ status: "failed", safeErrorCode, failedAt: now, nextRetryAt: null, updatedAt: now }).where(and(eq(contactRequestNotifications.id, id), eq(contactRequestNotifications.status, "processing"))).returning({ id: contactRequestNotifications.id }); return rows.length === 1; }
  async scheduleRetry(id: string, safeErrorCode: string, retryAt: Date, now: Date) { const db = createDatabaseClient(); const rows = await db.update(contactRequestNotifications).set({ status: "failed", safeErrorCode, failedAt: now, nextRetryAt: retryAt, updatedAt: now }).where(and(eq(contactRequestNotifications.id, id), eq(contactRequestNotifications.status, "processing"))).returning({ id: contactRequestNotifications.id }); return rows.length === 1; }
  async cancel(id: string, now: Date) { const db = createDatabaseClient(); const rows = await db.update(contactRequestNotifications).set({ status: "cancelled", nextRetryAt: null, updatedAt: now }).where(and(eq(contactRequestNotifications.id, id), inArray(contactRequestNotifications.status, ["pending", "failed", "processing"]))).returning({ id: contactRequestNotifications.id }); return rows.length === 1; }
  async findByContactRequest(contactRequestId: string, type: ContactRequestNotificationType) { const db = createDatabaseClient(); const [row] = await db.select().from(contactRequestNotifications).where(and(eq(contactRequestNotifications.contactRequestId, contactRequestId), eq(contactRequestNotifications.type, type))).limit(1); return row ? toRecord(row) : null; }
  async getDeliveryContext(contactRequestId: string) { const db = createDatabaseClient(); const [row] = await db.select({ contactRequestId: contactRequests.id, ownerAccountId: pets.accountId, petName: pets.name, finderName: contactRequests.finderName, finderContact: contactRequests.finderContact, message: contactRequests.message }).from(contactRequests).innerJoin(pets, eq(pets.id, contactRequests.petId)).where(eq(contactRequests.id, contactRequestId)).limit(1); return row ?? null; }
  async recordAudit(event: ContactNotificationAudit) { const db = createDatabaseClient(); await db.insert(auditLogs).values({ accountId: event.accountId, action: event.action, targetType: "contact_request_notification", targetId: event.notificationId, result: "success", metadata: { contactRequestId: event.contactRequestId, notificationId: event.notificationId, accountId: event.accountId, attemptCount: event.attemptCount, provider: event.provider, safeErrorCode: event.safeErrorCode } }); }
}
