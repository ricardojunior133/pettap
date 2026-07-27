import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  customerAddresses,
  customers,
  fulfilments,
  orderItems,
  orders,
  productPrices,
  productVariants,
  products,
} from "@/db/schema";
import {
  CustomerOrderService,
} from "@/features/commerce/services/customer-order-service";
import { CustomerAddressService } from "@/features/commerce/services/customer-address-service";
import { calculateOrderTotals } from "@/features/commerce/services/order-total-service";
import { canTransitionOrderStatus } from "@/features/commerce/services/order-status-service";
import { addressInputSchema } from "@/features/commerce/schemas/address";

const accountA = "11111111-1111-1111-1111-111111111111";
const accountB = "22222222-2222-2222-2222-222222222222";
const orderId = "33333333-3333-4333-8333-333333333333";

describe("Commerce foundation schema", () => {
  it("models the 0003 Commerce table graph and owner key", () => {
    expect(products[Symbol.for("drizzle:Name")]).toBe("products");
    expect(productVariants.productId.name).toBe("product_id");
    expect(productPrices.variantId.name).toBe("variant_id");
    expect(customers.accountId.name).toBe("account_id");
    expect(customerAddresses.customerId.name).toBe("customer_id");
    expect(orders.accountId.name).toBe("account_id");
    expect(orderItems.orderId.name).toBe("order_id");
    expect(fulfilments.orderId.name).toBe("order_id");
  });

  it("keeps the imported migrations as source-only, ordered dependencies", () => {
    const first = readFileSync(resolve(process.cwd(), "db/migrations/0001_enable_rls_and_account_isolation.sql"), "utf8");
    const commerce = readFileSync(resolve(process.cwd(), "db/migrations/0003_commerce_and_operations_foundation.sql"), "utf8");

    expect(first).toContain("CREATE OR REPLACE FUNCTION public.current_account_id()");
    expect(commerce).toContain('CREATE TABLE "orders"');
    expect(commerce).toContain("ENABLE ROW LEVEL SECURITY");
    expect(commerce).toContain("orders_select_own");
    expect(commerce).toContain("public.current_account_id()");
  });
});

describe("Commerce contracts", () => {
  it("normalizes the supported address shape without allowing unknown keys", () => {
    expect(addressInputSchema.parse({
      type: "shipping",
      fullName: "  Riley Owner ",
      addressLine1: "  1 Pet Lane ",
      city: " London ",
      postcode: "sw1a1aa",
      countryCode: "gb",
      isDefault: false,
    })).toMatchObject({ countryCode: "GB", postcode: "SW1A 1AA", company: null });
    expect(() => addressInputSchema.parse({ type: "shipping", fullName: "Riley", addressLine1: "1 Lane", city: "London", postcode: "SW1A 1AA", countryCode: "GB", unexpected: true })).toThrow();
  });

  it("calculates stored totals deterministically and protects status transitions", () => {
    expect(calculateOrderTotals({ items: [{ quantity: 2, unitPriceMinor: 1999 }], shippingTotalMinor: 299 })).toEqual({ subtotalMinor: 3998, discountTotalMinor: 0, shippingTotalMinor: 299, taxTotalMinor: 0, grandTotalMinor: 4297 });
    expect(canTransitionOrderStatus("paid", "in_production")).toBe(true);
    expect(canTransitionOrderStatus("completed", "draft")).toBe(false);
  });
});

describe("Customer order ownership boundary", () => {
  it("passes only the server-resolved account to the repository and returns a safe list DTO", async () => {
    let receivedAccountId: string | undefined;
    const service = new CustomerOrderService({
      listByAccount: async (accountId) => {
        receivedAccountId = accountId;
        return { rows: [{ orderId, orderNumber: "PT-1001", createdAt: new Date("2026-01-01T00:00:00.000Z"), status: "paid", paymentStatus: "paid", customerName: "Riley Owner", fulfilmentStatus: "queued", totalMinor: 4297, currency: "GBP", itemCount: 1, trackingSummary: null }], total: 1 };
      },
      getByIdForAccount: async () => null,
    }, async () => accountA);

    await expect(service.list()).resolves.toMatchObject({ total: 1, orders: [{ orderNumber: "PT-1001", totalMinor: 4297 }] });
    expect(receivedAccountId).toBe(accountA);
    expect(receivedAccountId).not.toBe(accountB);
  });

  it("does not query a repository for an invalid external order identifier", async () => {
    let queried = false;
    const service = new CustomerOrderService({
      listByAccount: async () => ({ rows: [], total: 0 }),
      getByIdForAccount: async () => { queried = true; return null; },
    }, async () => accountA);

    await expect(service.getById("not-an-order-id")).resolves.toBeNull();
    expect(queried).toBe(false);
  });

  it("scopes customer-address writes to the server-resolved account", async () => {
    let receivedAccountId: string | undefined;
    const service = new CustomerAddressService({
      listByCustomer: async () => [],
      create: async (accountId) => {
        receivedAccountId = accountId;
        return { id: "address-id", type: "shipping", fullName: "Riley", company: null, addressLine1: "1 Pet Lane", addressLine2: null, city: "London", county: null, postcode: "SW1A 1AA", countryCode: "GB", phone: null, isDefault: false };
      },
      update: async () => null,
      setDefault: async () => null,
      delete: async () => false,
    }, async () => accountA);

    await service.create(addressInputSchema.parse({ type: "shipping", fullName: "Riley", addressLine1: "1 Pet Lane", city: "London", postcode: "SW1A 1AA", countryCode: "GB", isDefault: false }));
    expect(receivedAccountId).toBe(accountA);
    expect(receivedAccountId).not.toBe(accountB);
  });
});
