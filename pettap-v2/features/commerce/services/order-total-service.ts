import type { OrderLineInput } from "../types/commerce";

export interface OrderTotalsInput {
  items: readonly OrderLineInput[];
  shippingTotalMinor?: number;
  discountTotalMinor?: number;
  taxTotalMinor?: number;
}

export interface OrderTotals {
  subtotalMinor: number;
  shippingTotalMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  grandTotalMinor: number;
}

function assertMinorAmount(value: number, field: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${field} must be a non-negative safe integer minor amount.`);
  }
}

/** Pure, server-agnostic total calculation. The database remains the authority for persisted totals. */
export function calculateOrderTotals(input: OrderTotalsInput): OrderTotals {
  const shippingTotalMinor = input.shippingTotalMinor ?? 0;
  const discountTotalMinor = input.discountTotalMinor ?? 0;
  const taxTotalMinor = input.taxTotalMinor ?? 0;
  assertMinorAmount(shippingTotalMinor, "Shipping");
  assertMinorAmount(discountTotalMinor, "Discount");
  assertMinorAmount(taxTotalMinor, "Tax");

  const subtotalMinor = input.items.reduce((total, item) => {
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new RangeError("Order item quantity must be a positive safe integer.");
    }
    assertMinorAmount(item.unitPriceMinor, "Unit price");
    const lineTotal = item.quantity * item.unitPriceMinor;
    if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(total + lineTotal)) {
      throw new RangeError("Order total exceeds the supported money range.");
    }
    return total + lineTotal;
  }, 0);

  if (discountTotalMinor > subtotalMinor) {
    throw new RangeError("Discount cannot exceed the item subtotal.");
  }

  const grandTotalMinor = subtotalMinor - discountTotalMinor + shippingTotalMinor + taxTotalMinor;
  if (!Number.isSafeInteger(grandTotalMinor)) {
    throw new RangeError("Order total exceeds the supported money range.");
  }

  return { subtotalMinor, shippingTotalMinor, discountTotalMinor, taxTotalMinor, grandTotalMinor };
}
