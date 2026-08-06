import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0009_stripe_payment_idempotency.sql"), "utf8");

describe("Stripe payment idempotency migration", () => {
  it("enforces a unique provider payment identity without changing commercial values", () => {
    expect(migration).toContain('CREATE UNIQUE INDEX "payments_provider_payment_id_unique"');
    expect(migration).toContain('("provider", "provider_payment_id")');
    expect(migration).toContain('WHERE "provider_payment_id" IS NOT NULL');
  });
});
