import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0008_guest_commerce_and_stripe_foundation.sql"), "utf8");

describe("guest commerce migration", () => {
  it("creates an explicit private checkout attempt instead of a fictional account", () => {
    expect(migration).toContain('CREATE TABLE "checkout_attempts"');
    expect(migration).toContain('ALTER TABLE "orders" ALTER COLUMN "account_id" DROP NOT NULL');
    expect(migration).not.toContain("CREATE TABLE \"guest_accounts\"");
  });

  it("enforces unique checkout, Stripe session, payment intent and event identities", () => {
    for (const index of ["checkout_attempts_reference_unique", "checkout_attempts_stripe_session_unique", "checkout_attempts_stripe_payment_intent_unique", "stripe_webhook_events_event_unique"]) {
      expect(migration).toContain(index);
    }
  });

  it("keeps new payment records private with RLS and no anonymous grants", () => {
    expect(migration).toContain('ALTER TABLE "checkout_attempts" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('ALTER TABLE "stripe_webhook_events" ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL ON TABLE "checkout_attempts", "stripe_webhook_events" FROM anon, authenticated');
    expect(migration).not.toMatch(/USING\s*\(\s*true\s*\)/i);
  });
});
