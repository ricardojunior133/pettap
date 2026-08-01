import "server-only";

import { createSupabaseAdminClient } from "@/lib/backend/supabase";
import { getServerEnv } from "@/lib/backend/env";
import { getContactNotificationProvider } from "./provider-factory";
import { DrizzleContactRequestNotificationRepository, type ContactRequestDeliveryContext, type ContactRequestNotificationRecord, type ContactRequestNotificationRepository } from "./contact-request-notification-repository";
import { renderFinderContactEmail } from "./templates";
import { PROCESSING_LEASE_DURATION_MS, type ContactNotificationProvider } from "./types";

const type = "finder_contact_received" as const;
const retryDelaysMs = [0, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000] as const;
/** A single worker invocation is deliberately bounded to protect the database and provider. */
export const CONTACT_NOTIFICATION_WORKER_BATCH_SIZE = 20;

export type TutorEmailResolver = (accountId: string) => Promise<string | null>;

export async function resolveTutorEmail(accountId: string) {
  const { data, error } = await createSupabaseAdminClient().auth.admin.getUserById(accountId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

function safeErrorCode(error: unknown) {
  if (error instanceof Error && /recipient/i.test(error.message)) return "recipient_unavailable";
  return "provider_failed";
}

function idempotencyKey(notificationId: string) { return `contact-request-notification:${notificationId}`; }

export class ContactRequestNotificationService {
  constructor(
    private readonly repository: ContactRequestNotificationRepository = new DrizzleContactRequestNotificationRepository(),
    private readonly provider: ContactNotificationProvider = getContactNotificationProvider(),
    private readonly resolveTutorEmail: TutorEmailResolver = resolveTutorEmail,
    private readonly siteUrl = getServerEnv().NEXT_PUBLIC_SITE_URL,
    private readonly now = () => new Date(),
  ) {}

  /** Queue-only: public finder submission never waits for provider delivery. */
  async enqueueForContactRequest(contactRequestId: string) {
    const context = await this.repository.getDeliveryContext(contactRequestId);
    if (!context) return { outcome: "missing" as const };
    let recipientEmail: string | null;
    try { recipientEmail = await this.resolveTutorEmail(context.ownerAccountId); } catch { recipientEmail = null; }
    if (!recipientEmail) {
      await this.safeAudit({ action: "contact.notification.failed", contactRequestId, notificationId: null, accountId: context.ownerAccountId, safeErrorCode: "recipient_unavailable" });
      return { outcome: "recipient_unavailable" as const };
    }
    const notification = await this.repository.enqueue({ contactRequestId, type, recipientEmail, provider: this.provider.name });
    if (!notification) return { outcome: "already_queued" as const };
    await this.safeAudit({ action: "contact.notification.queued", contactRequestId, notificationId: notification.id, accountId: context.ownerAccountId, provider: notification.provider, attemptCount: notification.attemptCount });
    return { outcome: "queued" as const, notificationId: notification.id };
  }

  /** Reusable worker entry point. A scheduler can call it later; none is added here. */
  async processPending(limit = CONTACT_NOTIFICATION_WORKER_BATCH_SIZE) {
    const records = await this.repository.findPendingForProcessing(
      this.now(),
      Math.min(Math.max(1, limit), CONTACT_NOTIFICATION_WORKER_BATCH_SIZE),
    );
    const outcomes: string[] = [];
    for (const candidate of records) outcomes.push(await this.processOne(candidate));
    return outcomes;
  }

  private async processOne(candidate: ContactRequestNotificationRecord) {
    const now = this.now();
    const processingLeaseExpiredBefore = new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS);
    const claimed = await this.repository.markProcessing(candidate.id, now, processingLeaseExpiredBefore);
    if (!claimed) return "skipped";
    const context = await this.repository.getDeliveryContext(claimed.contactRequestId);
    if (!context) {
      await this.repository.cancel(claimed.id, now);
      await this.safeAudit({ action: "contact.notification.cancelled", contactRequestId: claimed.contactRequestId, notificationId: claimed.id, accountId: null, attemptCount: claimed.attemptCount, provider: claimed.provider, safeErrorCode: "request_missing" });
      return "cancelled";
    }
    await this.safeAudit({ action: "contact.notification.processing", contactRequestId: claimed.contactRequestId, notificationId: claimed.id, accountId: context.ownerAccountId, attemptCount: claimed.attemptCount, provider: claimed.provider });
    try {
      const email = renderFinderContactEmail({ recipientEmail: claimed.recipientEmail, petName: context.petName, finderName: context.finderName, finderContact: context.finderContact, message: context.message, idempotencyKey: idempotencyKey(claimed.id), siteUrl: this.siteUrl });
      const result = await this.provider.send(email);
      await this.repository.markSent(claimed.id, result.providerMessageId, this.now());
      await this.safeAudit({ action: "contact.notification.sent", contactRequestId: claimed.contactRequestId, notificationId: claimed.id, accountId: context.ownerAccountId, attemptCount: claimed.attemptCount, provider: claimed.provider });
      return "sent";
    } catch (error) {
      const code = safeErrorCode(error);
      if (claimed.attemptCount >= retryDelaysMs.length) {
        await this.repository.markFailed(claimed.id, code, this.now());
        await this.safeAudit({ action: "contact.notification.failed", contactRequestId: claimed.contactRequestId, notificationId: claimed.id, accountId: context.ownerAccountId, attemptCount: claimed.attemptCount, provider: claimed.provider, safeErrorCode: code });
        return "failed";
      }
      const retryAt = new Date(this.now().getTime() + retryDelaysMs[claimed.attemptCount]);
      await this.repository.scheduleRetry(claimed.id, code, retryAt, this.now());
      await this.safeAudit({ action: "contact.notification.retry_scheduled", contactRequestId: claimed.contactRequestId, notificationId: claimed.id, accountId: context.ownerAccountId, attemptCount: claimed.attemptCount, provider: claimed.provider, safeErrorCode: code });
      return "retry_scheduled";
    }
  }

  private async safeAudit(event: Parameters<ContactRequestNotificationRepository["recordAudit"]>[0]) { try { await this.repository.recordAudit(event); } catch { /* notification persistence and delivery must not be rolled back by audit failure */ } }
}

export type { ContactRequestDeliveryContext };
