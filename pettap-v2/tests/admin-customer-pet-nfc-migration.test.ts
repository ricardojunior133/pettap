import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0005_admin_customer_pet_nfc_management.sql"), "utf8");

describe("admin customer, pet and NFC migration", () => {
  it("adds append-only tag status history and safe suspension metadata", () => {
    expect(migration).toContain('CREATE TABLE "nfc_tag_status_history"');
    expect(migration).toContain('"suspension_reason_code"');
    expect(migration).toContain('ALTER TABLE "nfc_tag_status_history" ENABLE ROW LEVEL SECURITY');
  });

  it("keeps Data API access denied and never stores activation secrets", () => {
    expect(migration).toContain('REVOKE ALL ON TABLE "nfc_tag_status_history" FROM anon, authenticated');
    expect(migration).not.toMatch(/activation[_ ]?(code|hash)|pepper|service_role/i);
    expect(migration).not.toMatch(/USING\s*\(\s*true\s*\)/i);
  });

  it("seeds permissions without creating members or changing existing tags", () => {
    expect(migration).toContain("'tags.suspend'");
    expect(migration).toContain("'tags.reassign'");
    expect(migration).not.toMatch(/INSERT INTO "admin_memberships"/);
    expect(migration).not.toMatch(/UPDATE "nfc_tags"/);
  });
});
