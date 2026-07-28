import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  CustomerOrderPage,
  CustomerOrderDetailRecord,
  CustomerOrderReadRecord,
  CustomerOrderPagination,
  OrderRepository,
} from "@/features/commerce/repositories/order-repository";
import {
  OrderReadService,
  toCustomerOrderStatus,
} from "@/features/commerce/services/order-read-service";

const accountA = "11111111-1111-1111-1111-111111111111";
const accountB = "22222222-2222-2222-2222-222222222222";

function record(overrides: Partial<CustomerOrderReadRecord> = {}): CustomerOrderReadRecord {
  return {
    orderNumber: "PT-10025",
    createdAt: new Date("2026-07-28T12:00:00.000Z"),
    status: "paid",
    fulfilmentStatus: "unfulfilled",
    totalMinor: 2798,
    currency: "GBP",
    itemCount: 1,
    trackingNumber: null,
    ...overrides,
  };
}

class FakeOrderRepository implements OrderRepository {
  readonly listCalls: Array<{ accountId: string; pagination: CustomerOrderPagination }> = [];
  readonly getCalls: Array<{ accountId: string; orderNumber: string }> = [];
  readonly detailCalls: Array<{ accountId: string; orderNumber: string }> = [];

  constructor(
    private readonly page: CustomerOrderPage = { rows: [], total: 0 },
    private readonly byNumber: Record<string, CustomerOrderReadRecord | null> = {},
    private readonly detailsByNumber: Record<string, CustomerOrderDetailRecord | null> = {},
  ) {}

  async listOrders(accountId: string, pagination: CustomerOrderPagination) {
    this.listCalls.push({ accountId, pagination });
    return this.page;
  }

  async getOrderByNumber(accountId: string, orderNumber: string) {
    this.getCalls.push({ accountId, orderNumber });
    return this.byNumber[`${accountId}:${orderNumber}`] ?? null;
  }

  async getOrderDetailByNumber(accountId: string, orderNumber: string) {
    this.detailCalls.push({ accountId, orderNumber });
    return this.detailsByNumber[`${accountId}:${orderNumber}`] ?? null;
  }
}

describe("customer order reads", () => {
  it("lists only with the authenticated account identifier and uses server pagination", async () => {
    const repository = new FakeOrderRepository({
      rows: [record({ orderNumber: "PT-10026", createdAt: new Date("2026-07-28") })],
      total: 13,
    });
    const service = new OrderReadService(repository, async () => accountA);

    const result = await service.listOrders({ page: 2 });

    expect(repository.listCalls).toEqual([{ accountId: accountA, pagination: { page: 2, pageSize: 12 } }]);
    expect(result).toMatchObject({ page: 2, pageSize: 12, total: 13, totalPages: 2 });
    expect(result.orders[0]?.orderNumber).toBe("PT-10026");
  });

  it("returns a safe DTO without internal, customer, payment, Stripe, or audit fields", async () => {
    const repository = new FakeOrderRepository({ rows: [record({ trackingNumber: "TRACK-100" })], total: 1 });
    const service = new OrderReadService(repository, async () => accountA);

    const order = (await service.listOrders()).orders[0];

    expect(order).toEqual({
      orderNumber: "PT-10025",
      createdAt: "2026-07-28T12:00:00.000Z",
      status: "Paid",
      total: 2798,
      currency: "GBP",
      itemCount: 1,
      trackingNumber: "TRACK-100",
    });
    expect(Object.keys(order ?? {})).not.toContain("id");
    expect(Object.keys(order ?? {})).not.toContain("accountId");
    expect(Object.keys(order ?? {})).not.toContain("customerId");
    expect(Object.keys(order ?? {})).not.toContain("paymentIntent");
  });

  it("does not reveal an order from another account", async () => {
    const repository = new FakeOrderRepository(
      { rows: [], total: 0 },
      { [`${accountB}:PT-10025`]: record() },
    );
    const service = new OrderReadService(repository, async () => accountA);

    await expect(service.getOrder("PT-10025")).resolves.toBeNull();
    expect(repository.getCalls).toEqual([{ accountId: accountA, orderNumber: "PT-10025" }]);
  });

  it("does not query orders when the authenticated account cannot be resolved", async () => {
    const repository = new FakeOrderRepository({ rows: [record()], total: 1 });
    const service = new OrderReadService(repository, async () => { throw new Error("Authentication is required"); });

    await expect(service.listOrders()).rejects.toThrow("Authentication is required");
    expect(repository.listCalls).toEqual([]);
  });

  it("preserves newest-first order supplied by the owner-scoped repository", async () => {
    const newest = record({ orderNumber: "PT-10026", createdAt: new Date("2026-07-28") });
    const oldest = record({ orderNumber: "PT-10025", createdAt: new Date("2026-07-27") });
    const service = new OrderReadService(new FakeOrderRepository({ rows: [newest, oldest], total: 2 }), async () => accountA);

    await expect(service.listOrders()).resolves.toMatchObject({ orders: [{ orderNumber: "PT-10026" }, { orderNumber: "PT-10025" }] });
  });

  it("returns an empty page without inventing order data", async () => {
    const service = new OrderReadService(new FakeOrderRepository(), async () => accountA);
    await expect(service.listOrders()).resolves.toEqual({ orders: [], page: 1, pageSize: 12, total: 0, totalPages: 0 });
  });

  it("maps canonical persisted statuses to customer-safe labels", () => {
    expect(toCustomerOrderStatus(record({ status: "in_production" }))).toBe("In Production");
    expect(toCustomerOrderStatus(record({ status: "ready_to_ship" }))).toBe("Packed");
    expect(toCustomerOrderStatus(record({ status: "shipped" }))).toBe("Shipped");
    expect(toCustomerOrderStatus(record({ status: "completed" }))).toBe("Delivered");
    expect(toCustomerOrderStatus(record({ status: "cancelled" }))).toBe("Cancelled");
  });

  it("keeps the database repository owner predicate and newest-first ordering in both reads", () => {
    const source = readFileSync(resolve(process.cwd(), "features/commerce/repositories/order-repository.ts"), "utf8");
    expect(source.match(/eq\(orders\.accountId, accountId\)/g)).toHaveLength(3);
    expect(source).toContain("orderBy(desc(orders.createdAt), desc(orders.orderNumber))");
  });
});
