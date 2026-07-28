import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  CustomerNotificationPage,
  CustomerNotificationPagination,
  CustomerNotificationRecord,
  CustomerNotificationRepository,
} from "@/features/account/repositories/customer-notification-repository";
import {
  CustomerNotificationService,
  toCustomerNotificationDto,
} from "@/features/account/services/customer-notification-service";

const accountA = "11111111-1111-1111-1111-111111111111";
const accountB = "22222222-2222-2222-2222-222222222222";

function record(overrides: Partial<CustomerNotificationRecord> = {}): CustomerNotificationRecord {
  return {
    notificationType: "payment_received",
    orderNumber: "PT-10025",
    status: "sent",
    createdAt: new Date("2026-07-28T14:35:00.000Z"),
    sentAt: new Date("2026-07-28T14:36:00.000Z"),
    ...overrides,
  };
}

class FakeNotificationRepository implements CustomerNotificationRepository {
  readonly calls: Array<{ accountId: string; pagination: CustomerNotificationPagination }> = [];
  constructor(private readonly page: CustomerNotificationPage = { rows: [], total: 0 }) {}
  async listByAccount(accountId: string, pagination: CustomerNotificationPagination) {
    this.calls.push({ accountId, pagination });
    return this.page;
  }
}

describe("customer notification history", () => {
  it("lists only notifications belonging to the authenticated account with server pagination", async () => {
    const repository = new FakeNotificationRepository({ rows: [record()], total: 13 });
    const service = new CustomerNotificationService(repository, async () => accountA);

    await expect(service.listNotifications({ page: 2 })).resolves.toMatchObject({ page: 2, pageSize: 12, total: 13, totalPages: 2 });
    expect(repository.calls).toEqual([{ accountId: accountA, pagination: { page: 2, pageSize: 12 } }]);
  });

  it("does not query notifications when authentication cannot resolve an account", async () => {
    const repository = new FakeNotificationRepository({ rows: [record()], total: 1 });
    const service = new CustomerNotificationService(repository, async () => { throw new Error("Authentication is required"); });
    await expect(service.listNotifications()).rejects.toThrow("Authentication is required");
    expect(repository.calls).toEqual([]);
  });

  it("maps known types and delivery states to public labels without internal fields", () => {
    const result = toCustomerNotificationDto(record({ notificationType: "shipped", status: "pending", sentAt: null }));
    expect(result).toEqual({ type: "Shipped", title: "Shipped", description: "Your order is on its way.", orderNumber: "PT-10025", status: "Processing", createdAt: "2026-07-28T14:35:00.000Z", sentAt: null });
    expect(Object.keys(result)).not.toEqual(expect.arrayContaining(["id", "accountId", "provider", "recipient", "payload", "html", "text", "lastError"]));
  });

  it("handles an unknown internal type safely and hides failed provider errors", () => {
    const result = toCustomerNotificationDto(record({ notificationType: "private_provider_event", status: "failed", sentAt: null }));
    expect(result).toMatchObject({ type: "Order update", title: "Order update", status: "Failed", sentAt: null });
    expect(result.description).not.toContain("private_provider_event");
  });

  it("keeps order ownership and newest-first ordering in the database repository", () => {
    const source = readFileSync(resolve(process.cwd(), "features/account/repositories/customer-notification-repository.ts"), "utf8");
    expect(source).toContain("eq(orders.accountId, accountId)");
    expect(source).toContain("eq(transactionalNotifications.orderId, orders.id)");
    expect(source).toContain("orderBy(desc(transactionalNotifications.createdAt), desc(orders.orderNumber))");
    expect(source).not.toContain("recipient:");
    expect(source).not.toContain("provider:");
  });

  it("never creates optional communication toggles without persisted preferences", () => {
    const source = readFileSync(resolve(process.cwd(), "app/account/notifications/page.tsx"), "utf8");
    expect(source).toContain("Optional communication preferences are not available yet");
    expect(source).not.toContain('type="checkbox"');
  });

  it("does not substitute account B data when account A is resolved", async () => {
    const repository = new FakeNotificationRepository({ rows: [], total: 0 });
    const service = new CustomerNotificationService(repository, async () => accountA);
    await service.listNotifications();
    expect(repository.calls[0]?.accountId).toBe(accountA);
    expect(repository.calls[0]?.accountId).not.toBe(accountB);
  });
});
