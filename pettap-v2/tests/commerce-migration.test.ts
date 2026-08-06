import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0003_commerce_and_operations_foundation.sql"), "utf8");

describe("commerce migration", () => {
  it("keeps the legacy placeholders outside the new model", () => {
    expect(migration).not.toContain("future_orders");
    expect(migration).not.toContain("future_products");
  });

  it("protects all commerce tables with RLS and avoids anonymous grants", () => {
    for (const table of ["products", "product_variants", "product_prices", "inventory_items", "customers", "customer_addresses", "shipping_methods", "orders", "order_items", "payments", "fulfilments", "order_status_history"]) {
      expect(migration).toContain(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
    }
    expect(migration).toContain("FROM anon, authenticated");
    expect(migration).not.toMatch(/GRANT[^;]+TO anon/i);
  });

  it("persists money as integer minor units and snapshots line pricing", () => {
    expect(migration).toContain('"unit_amount_minor" integer');
    expect(migration).toContain('"line_total_minor" integer');
    expect(migration).toContain('"personalisation" jsonb');
  });
});
