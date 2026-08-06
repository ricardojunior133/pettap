import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0001_enable_rls_and_account_isolation.sql"), "utf8");
const applicationTables = [
  "accounts",
  "profiles",
  "pets",
  "pet_photos",
  "medical_information",
  "vaccinations",
  "emergency_contacts",
  "nfc_tags",
  "tag_activations",
  "lost_reports",
  "activity_logs",
  "notifications",
  "audit_logs",
  "settings",
  "future_orders",
  "future_products",
];

describe("Sprint 13B RLS migration", () => {
  it("enables RLS for every application table", () => {
    for (const table of applicationTables) {
      expect(migration).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it("uses a constrained helper instead of browser-provided account IDs", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.current_account_id()");
    expect(migration).toContain("STABLE");
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("SET search_path = public");
    expect(migration).toContain("WHERE a.id = auth.uid()");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.current_account_id() FROM PUBLIC;");
    expect(migration).toContain("GRANT EXECUTE ON FUNCTION public.current_account_id() TO authenticated;");
  });

  it("has no anonymous grants or permissive policies", () => {
    expect(migration).toContain("FROM anon, authenticated;");
    expect(migration).not.toMatch(/TO anon\b/i);
    expect(migration).not.toMatch(/USING \(true\)/i);
    expect(migration).not.toMatch(/WITH CHECK \(true\)/i);
    expect(migration).not.toMatch(/FOR ALL TO authenticated/i);
  });

  it("guards ownership transfer through WITH CHECK", () => {
    expect(migration).toContain("pets_update_own_account");
    expect(migration).toContain("WITH CHECK (account_id = (SELECT public.current_account_id()))");
    expect(migration).toContain("vaccinations_update_own_pet");
    expect(migration).toContain("emergency_contacts_update_own_pet");
    expect(migration).toContain("nfc_tags_select_own_account");
  });

  it("keeps audit and future placeholder tables inaccessible to Data API users", () => {
    expect(migration).not.toMatch(/GRANT .*public\.audit_logs.*TO authenticated/i);
    expect(migration).not.toMatch(/GRANT .*public\.future_orders.*TO authenticated/i);
    expect(migration).not.toMatch(/GRANT .*public\.future_products.*TO authenticated/i);
  });
});
