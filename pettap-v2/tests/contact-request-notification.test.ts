import { describe, expect, it } from "vitest";

import type { ContactRequestNotificationRepository, ContactRequestNotificationRecord } from "@/features/contact-request-notifications/contact-request-notification-repository";
import { CONTACT_NOTIFICATION_WORKER_BATCH_SIZE, ContactRequestNotificationService } from "@/features/contact-request-notifications/contact-request-notification-service";
import { renderFinderContactEmail } from "@/features/contact-request-notifications/templates";
import { PROCESSING_LEASE_DURATION_MS, type ContactNotificationEmail, type ContactNotificationProvider } from "@/features/contact-request-notifications/types";

const notification: ContactRequestNotificationRecord = { id: "77777777-7777-4777-8777-777777777777", contactRequestId: "55555555-5555-4555-8555-555555555555", type: "finder_contact_received", status: "pending", recipientEmail: "owner@example.test", attemptCount: 0, lastAttemptAt: null, sentAt: null, failedAt: null, nextRetryAt: null, provider: "fake", providerMessageId: null, safeErrorCode: null, createdAt: new Date("2026-01-01T00:00:00Z"), updatedAt: new Date("2026-01-01T00:00:00Z") };
const context = { contactRequestId: notification.contactRequestId, ownerAccountId: "11111111-1111-4111-8111-111111111111", petName: "Charlie", finderName: "<Finder>", finderContact: "finder@example.test", message: "<b>Please call</b>" };

class FakeRepository implements ContactRequestNotificationRepository {
  queued: ContactRequestNotificationRecord | null = notification; pending: ContactRequestNotificationRecord[] = [notification]; audits: unknown[] = []; claimed: ContactRequestNotificationRecord | null = { ...notification, status: "processing", attemptCount: 1 }; sent = 0; retries: Date[] = []; failures = 0;
  async enqueue(_input: { contactRequestId: string; type: "finder_contact_received"; recipientEmail: string; provider: string }) { void _input; return this.queued; }
  async findPendingForProcessing(now: Date, limit: number) { void now; return this.pending.slice(0, limit); }
  async markProcessing(...args: [string, Date, Date]) { void args; return this.claimed; }
  async markSent(...args: [string, string | null, Date]) { void args; this.sent++; return true; }
  async markFailed(...args: [string, string, Date]) { void args; this.failures++; return true; }
  async scheduleRetry(...args: [string, string, Date, Date]) { this.retries.push(args[2]); return true; }
  async cancel(...args: [string, Date]) { void args; return true; }
  async findByContactRequest(...args: [string, "finder_contact_received"]) { void args; return null; }
  async getDeliveryContext(...args: [string]) { void args; return context; }
  async recordAudit(event: unknown) { this.audits.push(event); }
}
class FakeProvider implements ContactNotificationProvider { readonly name = "fake"; emails: ContactNotificationEmail[] = []; fail = false; async send(email: ContactNotificationEmail) { this.emails.push(email); if (this.fail) throw new Error("temporary provider failure"); return { providerMessageId: "message-1" }; } }

/** In-memory model of the same conditional database claim used by the repository. */
class LeaseQueueRepository extends FakeRepository {
  records: ContactRequestNotificationRecord[] = [];

  constructor(records: ContactRequestNotificationRecord[]) {
    super();
    this.records = records.map((record) => ({ ...record }));
  }

  async findPendingForProcessing(now: Date, limit: number) {
    const expiredBefore = new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS);
    return this.records.filter((record) =>
      record.status === "pending" ||
      (record.status === "failed" && record.nextRetryAt !== null && record.nextRetryAt <= now) ||
      (record.status === "processing" && record.updatedAt <= expiredBefore),
    ).slice(0, limit);
  }

  async markProcessing(id: string, now: Date, expiredBefore: Date) {
    const index = this.records.findIndex((record) => record.id === id);
    if (index < 0) return null;
    const record = this.records[index];
    const eligible = record.status === "pending" ||
      (record.status === "failed" && record.nextRetryAt !== null && record.nextRetryAt <= now) ||
      (record.status === "processing" && record.updatedAt <= expiredBefore);
    if (!eligible) return null;
    const claimed = { ...record, status: "processing" as const, attemptCount: record.attemptCount + 1, lastAttemptAt: now, nextRetryAt: null, updatedAt: now };
    this.records[index] = claimed;
    return claimed;
  }

  async markSent(id: string, providerMessageId: string | null, now: Date) {
    const index = this.records.findIndex((record) => record.id === id && record.status === "processing");
    if (index < 0) return false;
    this.records[index] = { ...this.records[index], status: "sent", providerMessageId, sentAt: now, updatedAt: now };
    this.sent += 1;
    return true;
  }

  async markFailed(id: string, safeErrorCode: string, now: Date) {
    const index = this.records.findIndex((record) => record.id === id && record.status === "processing");
    if (index < 0) return false;
    this.records[index] = { ...this.records[index], status: "failed", safeErrorCode, failedAt: now, nextRetryAt: null, updatedAt: now };
    this.failures += 1;
    return true;
  }

  async scheduleRetry(id: string, safeErrorCode: string, retryAt: Date, now: Date) {
    const index = this.records.findIndex((record) => record.id === id && record.status === "processing");
    if (index < 0) return false;
    this.records[index] = { ...this.records[index], status: "failed", safeErrorCode, failedAt: now, nextRetryAt: retryAt, updatedAt: now };
    this.retries.push(retryAt);
    return true;
  }

  async cancel(id: string, now: Date) {
    const index = this.records.findIndex((record) => record.id === id && ["pending", "failed", "processing"].includes(record.status));
    if (index < 0) return false;
    this.records[index] = { ...this.records[index], status: "cancelled", nextRetryAt: null, updatedAt: now };
    return true;
  }
}

describe("contact request notification foundation", () => {
  it("renders escaped HTML and text with only the private inbox CTA", () => {
    const email = renderFinderContactEmail({ recipientEmail: "owner@example.test", petName: "Charlie", finderName: "<Finder>", finderContact: "finder@example.test", message: "<b>Please call</b>", idempotencyKey: "key", siteUrl: "https://pettap.co.uk" });
    expect(email.html).toContain("&lt;Finder&gt;"); expect(email.html).not.toContain("<b>Please call</b>"); expect(email.text).toContain("<b>Please call</b>"); expect(email.html).toContain("/account/contact-requests");
    expect(JSON.stringify(email)).not.toMatch(/actorHash|publicCode|lostReportId|tagId|petId|storagePath/);
  });

  it("queues once for the resolved tutor and does not call a provider during public submission", async () => {
    const repository = new FakeRepository(); const provider = new FakeProvider();
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk");
    await expect(service.enqueueForContactRequest(notification.contactRequestId)).resolves.toEqual({ outcome: "queued", notificationId: notification.id });
    expect(provider.emails).toHaveLength(0); expect(JSON.stringify(repository.audits)).not.toMatch(/owner@example|Finder|Please call/);
    repository.queued = null;
    await expect(service.enqueueForContactRequest(notification.contactRequestId)).resolves.toEqual({ outcome: "already_queued" });
  });

  it("processes a claimed notification once and passes an idempotency key to the provider", async () => {
    const repository = new FakeRepository(); const provider = new FakeProvider(); const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk");
    await expect(service.processPending()).resolves.toEqual(["sent"]);
    expect(repository.sent).toBe(1); expect(provider.emails).toHaveLength(1); expect(provider.emails[0].idempotencyKey).toBe(`contact-request-notification:${notification.id}`);
  });

  it("schedules bounded retry without removing the contact request when delivery fails", async () => {
    const repository = new FakeRepository(); const provider = new FakeProvider(); provider.fail = true;
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => new Date("2026-01-01T00:00:00Z"));
    await expect(service.processPending()).resolves.toEqual(["retry_scheduled"]);
    expect(repository.retries).toEqual([new Date("2026-01-01T00:05:00Z")]); expect(repository.failures).toBe(0);
  });

  it("stops retrying after the bounded fourth attempt", async () => {
    const repository = new FakeRepository(); repository.claimed = { ...notification, status: "processing", attemptCount: 4 };
    const provider = new FakeProvider(); provider.fail = true;
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk");
    await expect(service.processPending()).resolves.toEqual(["failed"]);
    expect(repository.failures).toBe(1); expect(repository.retries).toHaveLength(0);
  });

  it("never queues when the owner recipient cannot be resolved", async () => {
    const repository = new FakeRepository(); const service = new ContactRequestNotificationService(repository, new FakeProvider(), async () => null, "https://pettap.co.uk");
    await expect(service.enqueueForContactRequest(notification.contactRequestId)).resolves.toEqual({ outcome: "recipient_unavailable" });
    expect(JSON.stringify(repository.audits)).not.toMatch(/owner@example|Finder|Please call/);
  });

  it("caps each worker run to the fixed server-side batch size", async () => {
    const repository = new FakeRepository(); repository.pending = Array.from({ length: CONTACT_NOTIFICATION_WORKER_BATCH_SIZE + 5 }, () => notification);
    const service = new ContactRequestNotificationService(repository, new FakeProvider(), async () => "owner@example.test", "https://pettap.co.uk");
    await service.processPending(999);
    expect(repository.sent).toBe(CONTACT_NOTIFICATION_WORKER_BATCH_SIZE);
  });

  it("uses the atomic claim to prevent a slow provider from delivering twice", async () => {
    class AtomicRepository extends FakeRepository {
      claimedOnce = false;
      async markProcessing(...args: [string, Date, Date]) { void args; if (this.claimedOnce) return null; this.claimedOnce = true; return this.claimed; }
    }
    const repository = new AtomicRepository();
    let releases = 0;
    const provider: ContactNotificationProvider = { name: "slow-fake", send: async () => { await Promise.resolve(); releases += 1; return { providerMessageId: null }; } };
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk");
    await Promise.all([service.processPending(), service.processPending()]);
    expect(releases).toBe(1);
    expect(repository.sent).toBe(1);
  });

  it("does not process a notification whose retry time is still in the future", async () => {
    class EligibleQueueRepository extends FakeRepository {
      async findPendingForProcessing(now: Date, limit: number) {
        return this.pending.filter((record) => record.status === "pending" || (record.status === "failed" && record.nextRetryAt !== null && record.nextRetryAt <= now)).slice(0, limit);
      }
    }
    const repository = new EligibleQueueRepository(); repository.pending = [{ ...notification, status: "failed", nextRetryAt: new Date("2030-02-01T00:00:00Z") }];
    const service = new ContactRequestNotificationService(repository, new FakeProvider(), async () => "owner@example.test", "https://pettap.co.uk");
    await expect(service.processPending()).resolves.toEqual([]);
    expect(repository.sent).toBe(0);
  });

  it("never selects a notification that was already sent", async () => {
    class EligibleQueueRepository extends FakeRepository {
      async findPendingForProcessing(_now: Date, limit: number) { return this.pending.filter((record) => record.status === "pending" || record.status === "failed").slice(0, limit); }
    }
    const repository = new EligibleQueueRepository(); repository.pending = [{ ...notification, status: "sent", sentAt: new Date() }];
    const service = new ContactRequestNotificationService(repository, new FakeProvider(), async () => "owner@example.test", "https://pettap.co.uk");
    await expect(service.processPending()).resolves.toEqual([]);
    expect(repository.sent).toBe(0);
  });

  it("does not recover a processing notification until its ten-minute lease expires", async () => {
    const now = new Date("2026-01-01T00:10:00Z");
    const repository = new LeaseQueueRepository([{ ...notification, status: "processing", attemptCount: 1, updatedAt: new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS + 1) }]);
    const provider = new FakeProvider();
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => now);

    await expect(service.processPending()).resolves.toEqual([]);
    expect(provider.emails).toHaveLength(0);
    expect(repository.records[0].status).toBe("processing");
  });

  it("recovers an expired processing lease and completes delivery", async () => {
    const now = new Date("2026-01-01T00:10:00Z");
    const repository = new LeaseQueueRepository([{ ...notification, status: "processing", attemptCount: 1, updatedAt: new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS) }]);
    const provider = new FakeProvider();
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => now);

    await expect(service.processPending()).resolves.toEqual(["sent"]);
    expect(provider.emails).toHaveLength(1);
    expect(repository.records[0]).toMatchObject({ status: "sent", attemptCount: 2 });
  });

  it("claims an expired processing notification only once across concurrent workers", async () => {
    const now = new Date("2026-01-01T00:10:00Z");
    const repository = new LeaseQueueRepository([{ ...notification, status: "processing", attemptCount: 1, updatedAt: new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS) }]);
    const provider = new FakeProvider();
    const first = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => now);
    const second = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => now);

    await Promise.all([first.processPending(), second.processPending()]);
    expect(provider.emails).toHaveLength(1);
    expect(repository.records[0].status).toBe("sent");
  });

  it("recovers a crash before the provider without counting a duplicate delivery", async () => {
    const claimedAt = new Date("2026-01-01T00:00:00Z");
    const recoveryAt = new Date(claimedAt.getTime() + PROCESSING_LEASE_DURATION_MS);
    const repository = new LeaseQueueRepository([{ ...notification }]);
    await repository.markProcessing(notification.id, claimedAt, new Date(claimedAt.getTime() - PROCESSING_LEASE_DURATION_MS));
    const provider = new FakeProvider();
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => recoveryAt);

    await expect(service.processPending()).resolves.toEqual(["sent"]);
    expect(provider.emails).toHaveLength(1);
  });

  it("reuses the same provider idempotency key after a crash after provider acceptance", async () => {
    const claimedAt = new Date("2026-01-01T00:00:00Z");
    const recoveryAt = new Date(claimedAt.getTime() + PROCESSING_LEASE_DURATION_MS);
    const repository = new LeaseQueueRepository([{ ...notification }]);
    await repository.markProcessing(notification.id, claimedAt, new Date(claimedAt.getTime() - PROCESSING_LEASE_DURATION_MS));
    const provider = new FakeProvider();
    await provider.send(renderFinderContactEmail({ recipientEmail: notification.recipientEmail, petName: context.petName, finderName: context.finderName, finderContact: context.finderContact, message: context.message, idempotencyKey: `contact-request-notification:${notification.id}`, siteUrl: "https://pettap.co.uk" }));
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => recoveryAt);

    await expect(service.processPending()).resolves.toEqual(["sent"]);
    expect(provider.emails).toHaveLength(2);
    expect(new Set(provider.emails.map((email) => email.idempotencyKey))).toEqual(new Set([`contact-request-notification:${notification.id}`]));
  });

  it("never recovers cancelled work and applies one total batch limit across eligible states", async () => {
    const now = new Date("2026-01-01T00:10:00Z");
    const eligible = Array.from({ length: CONTACT_NOTIFICATION_WORKER_BATCH_SIZE + 5 }, (_, index) => ({
      ...notification,
      id: `77777777-7777-4777-8777-${String(index).padStart(12, "0")}`,
      status: index % 3 === 0 ? "processing" as const : index % 3 === 1 ? "pending" as const : "failed" as const,
      nextRetryAt: index % 3 === 2 ? now : null,
      updatedAt: new Date(now.getTime() - PROCESSING_LEASE_DURATION_MS),
    }));
    const repository = new LeaseQueueRepository([{ ...notification, status: "cancelled" }, ...eligible]);
    const provider = new FakeProvider();
    const service = new ContactRequestNotificationService(repository, provider, async () => "owner@example.test", "https://pettap.co.uk", () => now);

    await service.processPending();
    expect(provider.emails).toHaveLength(CONTACT_NOTIFICATION_WORKER_BATCH_SIZE);
    expect(repository.records[0].status).toBe("cancelled");
  });
});
