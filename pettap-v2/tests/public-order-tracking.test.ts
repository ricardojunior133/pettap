import { describe, expect, it, vi } from "vitest";

import type { PublicOrderTrackingRepositoryContract, PublicTrackingRecord } from "@/features/commerce/repositories/public-order-tracking-repository";
import { PublicOrderTrackingService } from "@/features/commerce/services/public-order-tracking-service";
import { calculateTrackingProgress, trackingStages } from "@/features/commerce/services/tracking-progress";

const createdAt = new Date("2026-07-25T09:00:00.000Z");
const productionAt = new Date("2026-07-25T10:00:00.000Z");
const printedAt = new Date("2026-07-25T11:00:00.000Z");
const packedAt = new Date("2026-07-25T12:00:00.000Z");
const shippedAt = new Date("2026-07-25T13:00:00.000Z");
const deliveredAt = new Date("2026-07-25T14:00:00.000Z");

function record(overrides: Partial<PublicTrackingRecord> = {}): PublicTrackingRecord {
  return {
    order: { id: "internal-order-id", orderNumber: "PT-1234ABCD", createdAt, status: "shipped", fulfilmentStatus: "shipped" },
    item: { productName: "PetTap NFC Tag", variantName: "Classic", personalisation: { petName: "Charlie", collection: "Classic", colour: "Black", size: "Classic" } },
    fulfilment: { status: "shipped", provider: "Royal Mail", trackingNumber: "RM-TEST-123", trackingUrl: "https://tracking.example.test/RM-TEST-123", shippedAt, deliveredAt: null },
    notifications: [
      { notificationType: "payment_received", sentAt: createdAt, createdAt },
      { notificationType: "production_started", sentAt: productionAt, createdAt: productionAt },
      { notificationType: "printed", sentAt: printedAt, createdAt: printedAt },
      { notificationType: "packed", sentAt: packedAt, createdAt: packedAt },
      { notificationType: "shipped", sentAt: shippedAt, createdAt: shippedAt },
    ],
    history: [],
    ...overrides,
  };
}

function repository(value: PublicTrackingRecord | null): PublicOrderTrackingRepositoryContract {
  return { findByOrderNumber: vi.fn().mockResolvedValue(value) };
}

describe("tracking progress engine", () => {
  it("maps every canonical stage to one source-of-truth percentage", () => {
    expect(trackingStages.map(calculateTrackingProgress)).toEqual([10, 30, 50, 70, 90, 100]);
  });
});

describe("public order tracking", () => {
  it("returns a safe shipping view model with the canonical timeline", async () => {
    const service = new PublicOrderTrackingService(repository(record()));
    const tracking = await service.get(" pt-1234abcd ");
    expect(tracking).toMatchObject({ orderNumber: "PT-1234ABCD", status: "Shipped", progress: 90, pet: { name: "Charlie" }, product: { design: "Classic", colour: "Black", size: "Classic" }, shipping: { carrier: "Royal Mail", trackingNumber: "RM-TEST-123" } });
    expect(tracking?.timeline.map((entry) => entry.type)).toEqual(trackingStages);
    expect(tracking?.timeline.find((entry) => entry.type === "shipped")).toMatchObject({ current: true, completed: false, occurredAt: shippedAt.toISOString() });
    expect(tracking?.timeline.find((entry) => entry.type === "delivered")).toMatchObject({ current: false, completed: false, occurredAt: null });
    const serialized = JSON.stringify(tracking);
    for (const forbidden of ["internal-order-id", "account", "email", "phone", "address", "stripe", "customer"]) expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
  });

  it("returns null for a nonexistent or malformed public order number", async () => {
    const repo = repository(null);
    const service = new PublicOrderTrackingService(repo);
    await expect(service.get("not-an-order")).resolves.toBeNull();
    expect(repo.findByOrderNumber).not.toHaveBeenCalled();
    await expect(service.get("PT-1234ABCD")).resolves.toBeNull();
  });

  it("uses persisted notification and fulfilment timestamps for a delivered order", async () => {
    const delivered = record({
      order: { id: "internal-order-id", orderNumber: "PT-1234ABCD", createdAt, status: "completed", fulfilmentStatus: "delivered" },
      fulfilment: { status: "delivered", provider: "Royal Mail", trackingNumber: "RM-TEST-123", trackingUrl: "https://tracking.example.test/RM-TEST-123", shippedAt, deliveredAt },
      notifications: [...record().notifications, { notificationType: "delivered", sentAt: deliveredAt, createdAt: deliveredAt }],
    });
    const tracking = await new PublicOrderTrackingService(repository(delivered)).get("PT-1234ABCD");
    expect(tracking).toMatchObject({ status: "Delivered", progress: 100 });
    expect(tracking?.timeline.at(-1)).toMatchObject({ type: "delivered", current: true, occurredAt: deliveredAt.toISOString() });
  });

  it("falls back to status history for production progress", async () => {
    const inProduction = record({
      order: { id: "internal-order-id", orderNumber: "PT-1234ABCD", createdAt, status: "in_production", fulfilmentStatus: "in_production" },
      fulfilment: null,
      notifications: [{ notificationType: "payment_received", sentAt: createdAt, createdAt }],
      history: [{ newStatus: "in_production", reason: "Fulfilment unfulfilled to in_production", createdAt: productionAt }],
    });
    const tracking = await new PublicOrderTrackingService(repository(inProduction)).get("PT-1234ABCD");
    expect(tracking).toMatchObject({ status: "Production started", progress: 30 });
  });

  it("keeps unsafe external tracking URLs out of the public view model", async () => {
    const unsafe = record({ fulfilment: { status: "shipped", provider: "Royal Mail", trackingNumber: "RM-TEST-123", trackingUrl: "javascript:alert(1)", shippedAt, deliveredAt: null } });
    const tracking = await new PublicOrderTrackingService(repository(unsafe)).get("PT-1234ABCD");
    expect(tracking?.shipping.trackingUrl).toBeNull();
  });
});
