import { describe, expect, it, vi } from "vitest";

import type { CustomerOrderRepository } from "@/features/commerce/repositories/customer-order-repository";
import { CustomerOrderService } from "@/features/commerce/services/customer-order-service";

const orderId = "11111111-1111-4111-8111-111111111111";
const listRow = { orderId, orderNumber: "PT-1001", createdAt: new Date("2026-07-20T10:00:00.000Z"), status: "paid", fulfilmentStatus: "queued", totalMinor: 2499, currency: "GBP", itemCount: 2, trackingSummary: "TRACK-100" };
const detailRecord = {
  order: { id: orderId, orderNumber: "PT-1001", createdAt: new Date("2026-07-20T10:00:00.000Z"), status: "paid", fulfilmentStatus: "shipped", currency: "GBP", subtotalMinor: 2200, discountTotalMinor: 100, shippingTotalMinor: 299, taxTotalMinor: 0, totalMinor: 2399, shippingAddressSnapshot: { fullName: "Alex Taylor", addressLine1: "1 Example Street", city: "London", postcode: "SW1A 1AA", countryCode: "GB", phone: "private", internalNote: "never expose" } },
  items: [{ productName: "PetTap Tag", variantName: "Classic", sku: "PT-CLASSIC", quantity: 1, unitPriceMinor: 2200, lineTotalMinor: 2200, personalisation: { petName: "Charlie", shape: "Round", providerPayload: "private", stripeSessionId: "private" } }],
  fulfilment: { status: "shipped", provider: "Royal Mail", trackingNumber: "TRACK-100", trackingUrl: "https://tracking.example.test/100", shippedAt: new Date("2026-07-21T10:00:00.000Z"), deliveredAt: null },
};

function repository(overrides: Partial<CustomerOrderRepository> = {}): CustomerOrderRepository {
  return { listByAccount: vi.fn().mockResolvedValue({ rows: [listRow], total: 13 }), getByIdForAccount: vi.fn().mockResolvedValue(detailRecord), ...overrides };
}

describe("CustomerOrderService ownership and pagination", () => {
  it("lists only the authenticated account's orders with server-side pagination", async () => {
    const repo = repository();
    const service = new CustomerOrderService(repo, async () => "account-a");
    const result = await service.list({ page: 2 });
    expect(repo.listByAccount).toHaveBeenCalledWith("account-a", { page: 2, pageSize: 12 });
    expect(result.totalPages).toBe(2);
    expect(result.orders[0]?.orderNumber).toBe("PT-1001");
  });

  it("normalizes an invalid page to the first page", async () => {
    const repo = repository();
    const service = new CustomerOrderService(repo, async () => "account-a");
    await service.list({ page: 0 });
    expect(repo.listByAccount).toHaveBeenCalledWith("account-a", { page: 1, pageSize: 12 });
  });

  it("only looks up detail using the authenticated account and an order id", async () => {
    const repo = repository();
    const service = new CustomerOrderService(repo, async () => "account-a");
    await service.getById(orderId);
    expect(repo.getByIdForAccount).toHaveBeenCalledWith("account-a", orderId);
  });

  it("returns the same safe result for a foreign or nonexistent order", async () => {
    const repo = repository({ getByIdForAccount: vi.fn().mockResolvedValue(null) });
    const service = new CustomerOrderService(repo, async () => "account-b");
    await expect(service.getById(orderId)).resolves.toBeNull();
  });

  it("rejects anonymous visitors before querying orders", async () => {
    const repo = repository();
    const service = new CustomerOrderService(repo, async () => { throw new Error("Authentication is required."); });
    await expect(service.list()).rejects.toThrow("Authentication is required.");
    expect(repo.listByAccount).not.toHaveBeenCalled();
  });
});

describe("Customer order view model safety", () => {
  it("uses order, product and address snapshots and filters unknown fields", async () => {
    const service = new CustomerOrderService(repository(), async () => "account-a");
    const order = await service.getById(orderId);
    expect(order?.shippingAddressSnapshot?.addressLine1).toBe("1 Example Street");
    expect(order?.items[0]?.productName).toBe("PetTap Tag");
    expect(order?.items[0]?.personalisation).toEqual({ petName: "Charlie", shape: "Round" });
    expect(order?.tracking?.number).toBe("TRACK-100");
  });

  it("exposes totals, currency and optional tracking without private payment data", async () => {
    const service = new CustomerOrderService(repository(), async () => "account-a");
    const order = await service.getById(orderId);
    expect(order?.totalMinor).toBe(2399);
    expect(order?.currency).toBe("GBP");
    const serialized = JSON.stringify(order);
    for (const forbidden of ["accountId", "customerId", "internalNote", "stripe", "paymentIntent", "providerPayload", "notes", "metadata", "webhook"]) expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
  });

  it("rejects a malformed order id without querying the repository", async () => {
    const repo = repository();
    const service = new CustomerOrderService(repo, async () => "account-a");
    await expect(service.getById("not-an-order-id")).resolves.toBeNull();
    expect(repo.getByIdForAccount).not.toHaveBeenCalled();
  });
});
