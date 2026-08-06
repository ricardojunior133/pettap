import { describe, expect, it } from "vitest";

import { formatMoney } from "@/lib/money/format-money";
import { calculateOrderTotals } from "@/features/commerce/services/order-total-service";

describe("commerce money", () => {
  it("formats GBP minor units without floats", () => {
    expect(formatMoney(2499)).toBe("£24.99");
  });

  it("calculates immutable line totals in minor units", () => {
    expect(calculateOrderTotals({
      items: [{ quantity: 2, unitPriceMinor: 2499 }],
      shippingTotalMinor: 300,
      discountTotalMinor: 200,
      taxTotalMinor: 0,
    })).toEqual({
      subtotalMinor: 4998,
      shippingTotalMinor: 300,
      discountTotalMinor: 200,
      taxTotalMinor: 0,
      grandTotalMinor: 5098,
    });
  });

  it("rejects invalid amounts and discounts", () => {
    expect(() => calculateOrderTotals({ items: [{ quantity: 1, unitPriceMinor: -1 }] })).toThrow(RangeError);
    expect(() => calculateOrderTotals({ items: [{ quantity: 1, unitPriceMinor: 100 }], discountTotalMinor: 101 })).toThrow(RangeError);
  });
});
