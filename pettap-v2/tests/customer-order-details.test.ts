import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  CustomerOrderDetailRecord,
  CustomerOrderPage,
  CustomerOrderPagination,
  CustomerOrderReadRecord,
  OrderRepository,
} from "@/features/commerce/repositories/order-repository";
import {
  buildCustomerOrderTimeline,
  hasConsistentOrderTotals,
  OrderReadService,
} from "@/features/commerce/services/order-read-service";

const accountA = "11111111-1111-1111-1111-111111111111";
const accountB = "22222222-2222-2222-2222-222222222222";

function detailRecord(overrides: Partial<CustomerOrderDetailRecord> = {}): CustomerOrderDetailRecord {
  return {
    order: {
      orderNumber: "PT-10025",
      createdAt: new Date("2026-07-28T12:00:00.000Z"),
      status: "in_production",
      fulfilmentStatus: "in_production",
      currency: "GBP",
      subtotalMinor: 2499,
      discountTotalMinor: 200,
      shippingTotalMinor: 299,
      taxTotalMinor: 0,
      totalMinor: 2598,
      paymentStatus: "paid",
      cancelledAt: null,
    },
    items: [{
      productName: "PetTap Essential",
      variantName: "Classic",
      sku: "PET-ESS-CLA",
      quantity: 1,
      unitPriceMinor: 2499,
      lineTotalMinor: 2499,
      productionStatus: "quality_check",
      personalisation: {
        collection: "Essential",
        petName: "Charlie",
        colour: "Black",
        internalNote: "Do not expose",
        stripeSessionId: "cs_private",
      },
    }],
    fulfilment: {
      status: "in_production",
      carrier: "Royal Mail",
      trackingNumber: "RM-123",
      shippedAt: null,
      deliveredAt: null,
    },
    paymentReceivedAt: new Date("2026-07-27T10:00:00.000Z"),
    history: [],
    ...overrides,
  };
}

class DetailRepository implements OrderRepository {
  readonly detailCalls: Array<{ accountId: string; orderNumber: string }> = [];

  constructor(private readonly records: Record<string, CustomerOrderDetailRecord | null>) {}

  async listOrders(accountId: string, pagination: CustomerOrderPagination): Promise<CustomerOrderPage> {
    void accountId;
    void pagination;
    return { rows: [], total: 0 };
  }

  async getOrderByNumber(accountId: string, orderNumber: string): Promise<CustomerOrderReadRecord | null> {
    void accountId;
    void orderNumber;
    return null;
  }

  async getOrderDetailByNumber(accountId: string, orderNumber: string) {
    this.detailCalls.push({ accountId, orderNumber });
    return this.records[`${accountId}:${orderNumber}`] ?? null;
  }
}

describe("customer order detail reads", () => {
  it("returns the owner a safe detail DTO with allowlisted personalisation", async () => {
    const repository = new DetailRepository({ [`${accountA}:PT-10025`]: detailRecord() });
    const detail = await new OrderReadService(repository, async () => accountA).getOrderDetail("PT-10025");

    expect(detail).toMatchObject({
      orderNumber: "PT-10025",
      createdAt: "2026-07-28T12:00:00.000Z",
      status: "Printed",
      currency: "GBP",
      subtotal: 2499,
      discountTotal: 200,
      shippingTotal: 299,
      taxTotal: 0,
      total: 2598,
      items: [{
        productName: "PetTap Essential",
        variantName: "Classic",
        sku: "PET-ESS-CLA",
        quantity: 1,
        unitPrice: 2499,
        lineTotal: 2499,
        personalisation: { collection: "Essential", petName: "Charlie", colour: "Black" },
      }],
      tracking: { carrier: "Royal Mail", number: "RM-123", shippedAt: null, deliveredAt: null },
    });
    expect(detail?.timeline.map((event) => [event.key, event.status, event.occurredAt])).toEqual([
      ["payment", "completed", "2026-07-27T10:00:00.000Z"],
      ["production", "completed", null],
      ["printed", "current", null],
      ["packed", "upcoming", null],
      ["shipped", "upcoming", null],
      ["delivered", "upcoming", null],
    ]);
    expect(JSON.stringify(detail)).not.toContain("internalNote");
    expect(JSON.stringify(detail)).not.toContain("stripeSessionId");
    expect(JSON.stringify(detail)).not.toContain("accountId");
    expect(JSON.stringify(detail)).not.toContain("customerId");
  });

  it("returns the same null result for another account and a missing order", async () => {
    const repository = new DetailRepository({ [`${accountB}:PT-10025`]: detailRecord() });
    const service = new OrderReadService(repository, async () => accountA);

    await expect(service.getOrderDetail("PT-10025")).resolves.toBeNull();
    await expect(service.getOrderDetail("PT-404")).resolves.toBeNull();
    expect(repository.detailCalls).toEqual([
      { accountId: accountA, orderNumber: "PT-10025" },
      { accountId: accountA, orderNumber: "PT-404" },
    ]);
  });

  it("rejects malformed order numbers before any read", async () => {
    const repository = new DetailRepository({});
    const service = new OrderReadService(repository, async () => accountA);

    await expect(service.getOrderDetail("PT-10025/other-account")).resolves.toBeNull();
    expect(repository.detailCalls).toEqual([]);
  });

  it("validates financial totals exclusively in integer minor units", () => {
    expect(hasConsistentOrderTotals(detailRecord().order)).toBe(true);
    expect(hasConsistentOrderTotals({ ...detailRecord().order, totalMinor: 2599 })).toBe(false);
  });

  it("does not expose a tracking object when the order has no tracking number", async () => {
    const noTracking = detailRecord({ fulfilment: { status: "in_production", carrier: "Royal Mail", trackingNumber: null, shippedAt: null, deliveredAt: null } });
    const detail = await new OrderReadService(new DetailRepository({ [`${accountA}:PT-10025`]: noTracking }), async () => accountA).getOrderDetail("PT-10025");

    expect(detail?.tracking).toBeNull();
  });

  it("keeps the detail server action free from browser-supplied account identifiers", () => {
    const source = readFileSync(resolve(process.cwd(), "features/account/actions/customer-orders-actions.ts"), "utf8");
    expect(source).toContain("getCustomerOrderDetail(orderNumber: unknown)");
    expect(source).toContain("getOrderDetail(orderNumberInput.parse(orderNumber))");
    expect(source).not.toMatch(/getCustomerOrderDetail\([^)]*accountId/);
  });

  it("keeps the detail repository read-only", () => {
    const source = readFileSync(resolve(process.cwd(), "features/commerce/repositories/order-repository.ts"), "utf8");
    expect(source).toContain("getOrderDetailByNumber(accountId: string, orderNumber: string)");
    expect(source).not.toContain(".insert(");
    expect(source).not.toContain(".update(");
    expect(source).not.toContain(".delete(");
  });

  it("builds the canonical paid, production, printed, packed, shipped, and delivered states", () => {
    const paid = buildCustomerOrderTimeline(detailRecord({
      order: { ...detailRecord().order, status: "paid", fulfilmentStatus: "unfulfilled" },
      items: [{ ...detailRecord().items[0], productionStatus: "not_started" }],
    }));
    const packed = buildCustomerOrderTimeline(detailRecord({
      order: { ...detailRecord().order, status: "ready_to_ship", fulfilmentStatus: "ready" },
      items: [{ ...detailRecord().items[0], productionStatus: "completed" }],
    }));
    const shipped = buildCustomerOrderTimeline(detailRecord({
      order: { ...detailRecord().order, status: "shipped", fulfilmentStatus: "shipped" },
      fulfilment: { ...detailRecord().fulfilment!, status: "shipped", trackingNumber: null, shippedAt: new Date("2026-07-28T13:00:00.000Z") },
    }));
    const delivered = buildCustomerOrderTimeline(detailRecord({
      order: { ...detailRecord().order, status: "completed", fulfilmentStatus: "delivered" },
      fulfilment: { ...detailRecord().fulfilment!, status: "delivered", deliveredAt: new Date("2026-07-29T13:00:00.000Z") },
    }));

    expect(paid[0]?.status).toBe("current");
    expect(packed.find((event) => event.key === "packed")?.status).toBe("current");
    expect(shipped.find((event) => event.key === "shipped")?.occurredAt).toBe("2026-07-28T13:00:00.000Z");
    expect(shipped.find((event) => event.key === "delivered")?.status).toBe("upcoming");
    expect(delivered.find((event) => event.key === "delivered")?.status).toBe("current");
  });

  it("deduplicates out-of-order history and preserves the earliest persisted timestamp", () => {
    const timeline = buildCustomerOrderTimeline(detailRecord({
      history: [
        { status: "shipped", occurredAt: new Date("2026-07-30T10:00:00.000Z") },
        { status: "paid", occurredAt: new Date("2026-07-27T10:00:00.000Z") },
        { status: "shipped", occurredAt: new Date("2026-07-29T10:00:00.000Z") },
        { status: "future_unknown", occurredAt: new Date("2026-07-31T10:00:00.000Z") },
      ],
    }));

    expect(timeline.filter((event) => event.key === "shipped")).toHaveLength(1);
    expect(timeline.find((event) => event.key === "shipped")?.occurredAt).toBe("2026-07-29T10:00:00.000Z");
    expect(timeline.some((event) => event.key === "cancelled")).toBe(false);
  });

  it("does not fabricate missing timestamps and treats a cancellation as terminal", () => {
    const timeline = buildCustomerOrderTimeline(detailRecord({
      order: { ...detailRecord().order, status: "cancelled", fulfilmentStatus: "cancelled", cancelledAt: new Date("2026-07-28T15:00:00.000Z") },
      paymentReceivedAt: null,
      history: [{ status: "paid", occurredAt: new Date("2026-07-27T10:00:00.000Z") }],
      fulfilment: null,
      items: [{ ...detailRecord().items[0], productionStatus: "not_started" }],
    }));

    expect(timeline.find((event) => event.key === "payment")).toMatchObject({ status: "completed", occurredAt: "2026-07-27T10:00:00.000Z" });
    expect(timeline.find((event) => event.key === "delivered")?.status).toBe("upcoming");
    expect(timeline.at(-1)).toEqual(expect.objectContaining({ key: "cancelled", status: "cancelled", occurredAt: "2026-07-28T15:00:00.000Z" }));
  });
});
