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

    expect(detail).toEqual({
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
});
