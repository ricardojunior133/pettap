import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration0006 = readFileSync(resolve(root, "db/migrations/0006_admin_orders_production_fulfilment.sql"), "utf8");
const migration0007 = readFileSync(resolve(root, "db/migrations/0007_customer_privacy_controls.sql"), "utf8");
const commerceSchema = readFileSync(resolve(root, "db/schema/commerce.ts"), "utf8");
const coreSchema = readFileSync(resolve(root, "db/schema/core.ts"), "utf8");
const journal = JSON.parse(readFileSync(resolve(root, "db/migrations/meta/_journal.json"), "utf8")) as { entries: Array<{ idx: number; tag: string; when: number; breakpoints: boolean }> };

describe("migration journal 0006 → 0007", () => {
  it("has one official journal with sequential, matching entries", () => {
    expect(existsSync(resolve(root, "db/migrations/meta/_journal.json"))).toBe(true);
    expect(existsSync(resolve(root, "db/migrations/meta_journal.json"))).toBe(false);
    const tags = journal.entries.map((entry) => entry.tag);
    expect(tags).toEqual([
      "0000_chilly_nebula", "0001_enable_rls_and_account_isolation", "0002_pet_photo_storage_security",
      "0003_commerce_and_operations_foundation", "0004_admin_rbac_foundation", "0005_admin_customer_pet_nfc_management",
      "0006_admin_orders_production_fulfilment", "0007_customer_privacy_controls", "0008_guest_commerce_and_stripe_foundation", "0009_stripe_payment_idempotency", "0010_transactional_notification_history", "0011_event_demo_foundation",
    ]);
    journal.entries.forEach((entry, index) => {
      expect(entry.idx).toBe(index);
      expect(entry.when).toBeGreaterThan(0);
      expect(entry.breakpoints).toBe(true);
      expect(existsSync(resolve(root, `db/migrations/${entry.tag}.sql`))).toBe(true);
    });
  });
});

describe("migration 0006 contract", () => {
  it("aligns the admin-note table, constraint, FK restrictions and index with Drizzle", () => {
    expect(migration0006).toContain('CREATE TABLE "order_admin_notes"');
    expect(migration0006).toContain('REFERENCES "orders"("id") ON DELETE restrict');
    expect(migration0006).toContain('REFERENCES "accounts"("id") ON DELETE restrict');
    expect(migration0006).toContain('CHECK (char_length("body") BETWEEN 1 AND 2000)');
    expect(migration0006).toContain('CREATE INDEX "order_admin_notes_order_created_idx"');
    expect(commerceSchema).toContain('check("order_admin_notes_body_check", sql`char_length(${t.body}) BETWEEN 1 AND 2000`)');
  });

  it("keeps admin notes inaccessible to anon and authenticated database roles", () => {
    expect(migration0006).toContain('ALTER TABLE "order_admin_notes" ENABLE ROW LEVEL SECURITY');
    expect(migration0006).toContain('REVOKE ALL ON TABLE "order_admin_notes" FROM anon, authenticated');
    expect(migration0006).not.toMatch(/GRANT\s+.*order_admin_notes.*TO\s+(anon|authenticated)/i);
    expect(migration0006).not.toMatch(/USING\s*\(\s*true\s*\)/i);
  });

  it("adds idempotent system permissions without creating memberships or orders", () => {
    expect(migration0006).toContain("ON CONFLICT (\"code\") DO NOTHING");
    expect(migration0006).toContain("ON CONFLICT DO NOTHING");
    expect(migration0006).not.toContain('INSERT INTO "admin_memberships"');
    expect(migration0006).not.toContain('INSERT INTO "orders"');
  });
});

describe("migration 0007 contract", () => {
  it("adds only a nullable archive timestamp and its account index", () => {
    expect(migration0007).toContain('ALTER TABLE "pets" ADD COLUMN "archived_at" timestamp with time zone');
    expect(migration0007).toContain('CREATE INDEX "pets_account_archived_idx" ON "pets" USING btree ("account_id", "archived_at")');
    expect(coreSchema).toContain('archivedAt: timestamp("archived_at", { withTimezone: true })');
    expect(coreSchema).toContain('index("pets_account_archived_idx").on(t.accountId, t.archivedAt)');
  });

  it("keeps every preference private by default and unique per pet", () => {
    expect(migration0007).toContain('"pet_id" uuid PRIMARY KEY REFERENCES "pets"("id") ON DELETE cascade');
    for (const field of ["show_photo", "show_name", "show_breed", "show_age", "show_medical_conditions", "show_medications", "show_primary_contact", "show_emergency_contacts", "show_special_instructions"]) {
      expect(migration0007).toContain(`"${field}" boolean NOT NULL DEFAULT false`);
    }
  });

  it("uses owner-scoped RLS without granting deletion or public access", () => {
    expect(migration0007).toContain('ALTER TABLE "pet_public_preferences" ENABLE ROW LEVEL SECURITY');
    expect(migration0007).toContain('REVOKE ALL ON TABLE "pet_public_preferences" FROM anon, authenticated');
    expect(migration0007).toContain('GRANT SELECT, INSERT, UPDATE ON TABLE "pet_public_preferences" TO authenticated');
    expect(migration0007).toContain('"pets"."account_id" = (SELECT public.current_account_id())');
    expect(migration0007).not.toMatch(/USING\s*\(\s*true\s*\)/i);
    expect(migration0007).not.toMatch(/GRANT\s+.*DELETE.*pet_public_preferences.*authenticated/i);
  });
});
