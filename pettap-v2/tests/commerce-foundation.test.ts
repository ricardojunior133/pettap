import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
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

  it("preserves the complete canonical migration history recorded in the remote ledger", () => {
    const migrationsDirectory = resolve(process.cwd(), "db/migrations");
    const canonical = {
      "0000_chilly_nebula.sql": "672c645f6434b4ca45a803c491f75cbc86302e80a27ad647206041dc3f9f1cd9",
      "0001_enable_rls_and_account_isolation.sql": "7cf313a1001bc3213bfe240297d10988a9cabbe419db785befce63ceae085ee2",
      "0002_pet_photo_storage_security.sql": "9ed322e3a6093a1dc0501cdc98834718f0b4cbae3fca5f98561c32396cae946a",
      "0003_commerce_and_operations_foundation.sql": "723c72ef63703f013600664bc238a96c4d41cb731c0f2de78cd2392c00a919bf",
      "0004_admin_rbac_foundation.sql": "b0528d8d0a70fcf1a314ebb8643fa179d69166a2e19dbf235fd0cb24e74715f1",
      "0005_admin_customer_pet_nfc_management.sql": "0f8d981e93a605d893460d20f5d3bf650f48a6fda658c25b20b23972a0fa6357",
      "0006_admin_orders_production_fulfilment.sql": "5a21614fc886cffb6dba155f999eaff4ebd0c9cd6b7422bb524e27fdbcca0d27",
      "0007_customer_privacy_controls.sql": "2db05219e14f834f47a52c98864a26ea83f707e67e1fa481efbea32c17dbcafd",
      "0008_guest_commerce_and_stripe_foundation.sql": "1c42f862e44060ed9da65a496f638c69d7e93db88a004ef37041e214a2f1d8cb",
      "0009_stripe_payment_idempotency.sql": "a08ec75273acc7640c3ffd0b456160c1fe22293113a4824965f92fe1e0ce17da",
      "0010_transactional_notification_history.sql": "01cc156e04228c0ec69d0ab6529da674d03dc4af9f45929b6c51d3dadd3da0ac",
      "0011_event_demo_foundation.sql": "48f67903848c35ce9b05ad71d7c3f1e263805abb94f2106d45edf0b701715480",
      "0012_nfc_tag_credential_foundation.sql": "298f41f92fccc34d0465e384997014f3f3c2c0e45cf5ccbb53e3de88f6aaf1a5",
    };

    for (const [file, expectedHash] of Object.entries(canonical)) {
      const bytes = readFileSync(resolve(migrationsDirectory, file));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(expectedHash);
    }

    const journal = JSON.parse(readFileSync(resolve(migrationsDirectory, "meta/_journal.json"), "utf8")) as { entries: Array<{ tag: string }> };
    const names = readdirSync(migrationsDirectory).filter((name) => name.endsWith(".sql")).sort();
    expect(names).toEqual(Object.keys(canonical));
    expect(journal.entries.map((entry) => entry.tag)).toEqual(Object.keys(canonical).map((name) => name.replace(/\.sql$/, "")));
    expect(readdirSync(resolve(migrationsDirectory, "meta")).sort()).toEqual([
      ...Object.keys(canonical).map((_, index) => `${String(index).padStart(4, "0")}_snapshot.json`),
      "_journal.json",
    ]);
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
