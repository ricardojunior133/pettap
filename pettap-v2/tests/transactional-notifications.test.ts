import { describe, expect, it, vi } from "vitest";

import { ConsoleNotificationProvider } from "@/features/transactional-notifications/providers/console-provider";
import { ResendNotificationProvider } from "@/features/transactional-notifications/providers/resend-provider";
import { getTransactionalNotificationProvider, resolveTransactionalNotificationProvider } from "@/features/transactional-notifications/provider-resolver";
import type { TransactionalNotificationRecord, TransactionalNotificationRepository, TransactionalOrderContext } from "@/features/transactional-notifications/repository";
import { TransactionalNotificationService } from "@/features/transactional-notifications/service";
import { renderTransactionalEmail } from "@/features/transactional-notifications/templates";
import { transactionalNotificationEvents, type NotificationProvider, type TransactionalNotificationEvent } from "@/features/transactional-notifications/types";

const payload = {
  orderNumber: "PT-12345678",
  petName: "Charlie",
  summary: "Classic · Black · Matte",
  accountUrl: "https://pettap.test/account/orders/id",
  orderTrackingUrl: "https://pettap.test/track/PT-12345678",
  carrierTrackingUrl: "https://royalmail.example/track/RM123",
  trackingNumber: "RM123",
  carrier: "Royal Mail",
};

describe("transactional notification templates", () => {
  it("renders British-English order content without exposing private payment data", () => {
    const email = renderTransactionalEmail("shipped", "owner@example.test", payload, { supportEmail: "support@pettap.test" });
    expect(email.subject).toBe("Your PetTap is on the way");
    expect(email.text).toContain("RM123");
    expect(email.html).toContain("Track your order");
    expect(email.html).toContain("Track with Royal Mail");
    expect(email.html).toContain("Privacy");
    expect(email.html).toContain("Terms");
    expect(email.text).not.toContain("stripe");
  });

  it.each(transactionalNotificationEvents)("renders the %s template with responsive branded content", (template) => {
    const email = renderTransactionalEmail(template, "owner@example.test", payload);
    expect(email.html).toContain("color-scheme");
    expect(email.html).toContain("Pet<span");
    expect(email.text).toContain("Order PT-12345678");
  });

  it("uses the development console provider without a network request", async () => {
    await expect(new ConsoleNotificationProvider().send(renderTransactionalEmail("payment_received", "owner@example.test", payload))).resolves.toEqual({ providerMessageId: null });
  });

  it("selects the console provider in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getTransactionalNotificationProvider()).toBeInstanceOf(ConsoleNotificationProvider);
    vi.unstubAllEnvs();
  });

  it("resolves Resend only for a configured production environment", () => {
    expect(resolveTransactionalNotificationProvider("production", {}).name).toBe("unconfigured");
    expect(resolveTransactionalNotificationProvider("development", { RESEND_API_KEY: "key", EMAIL_FROM: "from@example.test", EMAIL_REPLY_TO: "reply@example.test" })).toBeInstanceOf(ConsoleNotificationProvider);
    expect(resolveTransactionalNotificationProvider("production", { RESEND_API_KEY: "key", EMAIL_FROM: "from@example.test", EMAIL_REPLY_TO: "reply@example.test" })).toBeInstanceOf(ResendNotificationProvider);
  });
});

describe("Resend notification provider", () => {
  it("sends the branded payload with From and Reply-To server-side headers", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ id: "resend-message-1" }), { status: 200 }));
    const provider = new ResendNotificationProvider({ apiKey: "resend-test-key", from: "hello@pettap.test", replyTo: "support@pettap.test", fetcher });
    await expect(provider.send(renderTransactionalEmail("shipped", "owner@example.test", payload))).resolves.toEqual({ providerMessageId: "resend-message-1" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const calls = fetcher.mock.calls as unknown as Array<[RequestInfo | URL, RequestInit]>;
    const request = calls[0]?.[1];
    expect(request).toMatchObject({ headers: { Authorization: "Bearer resend-test-key", "Content-Type": "application/json" } });
    expect(JSON.parse(String(request?.body))).toMatchObject({ from: "hello@pettap.test", reply_to: "support@pettap.test", to: ["owner@example.test"] });
  });

  it("retries temporary provider failures with exponential backoff", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "retried-message" }), { status: 200 }));
    const sleep = vi.fn(async () => undefined);
    const provider = new ResendNotificationProvider({ apiKey: "key", from: "hello@pettap.test", replyTo: "support@pettap.test", fetcher, sleep });
    await expect(provider.send(renderTransactionalEmail("packed", "owner@example.test", payload))).resolves.toEqual({ providerMessageId: "retried-message" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(250);
  });

  it("fails safely without retrying a permanent provider rejection", async () => {
    const fetcher = vi.fn(async () => new Response("invalid", { status: 400 }));
    const provider = new ResendNotificationProvider({ apiKey: "key", from: "hello@pettap.test", replyTo: "support@pettap.test", fetcher });
    await expect(provider.send(renderTransactionalEmail("payment_received", "owner@example.test", payload))).rejects.toMatchObject({ name: "ResendProviderError", status: 400 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

class FakeNotificationRepository implements TransactionalNotificationRepository {
  readonly records: TransactionalNotificationRecord[] = [];
  readonly context: TransactionalOrderContext = {
    id: "order-1", accountId: "account-1", orderNumber: "PT-12345678", customerEmail: "owner@example.test",
    petName: "Charlie", summary: "Classic · Black · Matte", trackingUrl: "https://tracking.example/test", carrier: "Royal Mail", trackingNumber: "RM123",
  };
  failCreate = false;

  async findByOrderAndType(orderId: string, type: TransactionalNotificationEvent) { return this.records.find((record) => record.orderId === orderId && record.notificationType === type) ?? null; }
  async createPending(input: Omit<TransactionalNotificationRecord, "id" | "status" | "providerMessageId" | "errorMessage" | "createdAt" | "sentAt" | "failedAt">) {
    if (this.failCreate || await this.findByOrderAndType(input.orderId, input.notificationType)) return null;
    const record: TransactionalNotificationRecord = { ...input, id: `notification-${this.records.length + 1}`, status: "pending", providerMessageId: null, errorMessage: null, createdAt: new Date(), sentAt: null, failedAt: null };
    this.records.push(record);
    return record;
  }
  async markSent(id: string, providerMessageId: string | null) { const record = this.records.find((entry) => entry.id === id); if (record) Object.assign(record, { status: "sent" as const, providerMessageId, sentAt: new Date() }); }
  async markFailed(id: string, errorMessage: string) { const record = this.records.find((entry) => entry.id === id); if (record) Object.assign(record, { status: "failed" as const, errorMessage, failedAt: new Date() }); }
  async listByOrder(orderId: string) { return this.records.filter((record) => record.orderId === orderId); }
  async getOrderContext(orderId: string) { return orderId === this.context.id ? this.context : null; }
}

function provider(send: NotificationProvider["send"]): NotificationProvider { return { name: "test", send }; }

describe("transactional notification persistence", () => {
  it("persists pending then sent for an authenticated order", async () => {
    const repository = new FakeNotificationRepository();
    const service = new TransactionalNotificationService(repository, provider(async () => ({ providerMessageId: "message-1" })), "https://pettap.example");
    await expect(service.sendTransactionalNotification({ orderId: "order-1", type: "payment_received" })).resolves.toEqual({ outcome: "sent", notificationId: "notification-1" });
    expect(repository.records[0]).toMatchObject({ accountId: "account-1", status: "sent", recipient: "owner@example.test", providerMessageId: "message-1" });
  });

  it("supports guest orders without an account", async () => {
    const repository = new FakeNotificationRepository(); repository.context.accountId = null;
    const service = new TransactionalNotificationService(repository, provider(async () => ({ providerMessageId: null })), "https://pettap.example");
    await service.sendTransactionalNotification({ orderId: "order-1", type: "shipped" });
    expect(repository.records[0]?.accountId).toBeNull(); expect(repository.records[0]?.status).toBe("sent");
  });

  it("records provider failures without throwing to the order operation", async () => {
    const repository = new FakeNotificationRepository();
    const service = new TransactionalNotificationService(repository, provider(async () => { throw new Error("provider unavailable"); }), "https://pettap.example");
    await expect(service.sendTransactionalNotification({ orderId: "order-1", type: "packed" })).resolves.toEqual({ outcome: "failed", notificationId: "notification-1" });
    expect(repository.records[0]).toMatchObject({ status: "failed", errorMessage: "provider unavailable" });
  });

  it.each(transactionalNotificationEvents)("persists the %s operational event exactly once", async (type) => {
    const repository = new FakeNotificationRepository(); const send = vi.fn(async () => ({ providerMessageId: null }));
    const service = new TransactionalNotificationService(repository, provider(send), "https://pettap.example");
    await service.sendTransactionalNotification({ orderId: "order-1", type });
    await service.sendTransactionalNotification({ orderId: "order-1", type });
    expect(repository.records).toHaveLength(1); expect(repository.records[0]).toMatchObject({ notificationType: type, status: "sent" }); expect(send).toHaveBeenCalledTimes(1);
  });
});
