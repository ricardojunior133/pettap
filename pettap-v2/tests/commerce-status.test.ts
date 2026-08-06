import { describe, expect, it } from "vitest";

import { assertOrderStatusTransition, canTransitionOrderStatus } from "@/features/commerce/services/order-status-service";

describe("order status lifecycle", () => {
  it("permits the production path", () => {
    expect(canTransitionOrderStatus("paid", "in_production")).toBe(true);
    expect(canTransitionOrderStatus("ready_to_ship", "shipped")).toBe(true);
  });

  it("does not permit terminal or backwards transitions", () => {
    expect(canTransitionOrderStatus("completed", "paid")).toBe(false);
    expect(() => assertOrderStatusTransition("cancelled", "paid")).toThrow("cannot transition");
  });
});
