import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0004_admin_rbac_foundation.sql"), "utf8");

describe("admin RBAC migration", () => {
  it("creates the database-backed RBAC model without bootstrap membership", () => {
    for (const table of ["admin_roles", "admin_permissions", "admin_role_permissions", "admin_memberships"]) {
      expect(migration).toContain(`CREATE TABLE "${table}"`);
      expect(migration).toContain(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
    }
    expect(migration).toContain('CONSTRAINT "admin_roles_code_unique" UNIQUE("code")');
    expect(migration).toContain('CONSTRAINT "admin_permissions_code_unique" UNIQUE("code")');
    expect(migration).not.toMatch(/INSERT INTO "admin_memberships"/);
  });

  it("keeps the Data API denied by default", () => {
    expect(migration).toContain("FROM anon, authenticated");
    expect(migration).not.toMatch(/CREATE POLICY[\s\S]+USING\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/GRANT[^;]+TO anon/i);
  });

  it("seeds only stable roles and permission mappings", () => {
    for (const code of ["support", "operations", "admin", "super_admin", "admins.manage", "admin.dashboard.read"]) {
      expect(migration).toContain(`'${code}'`);
    }
  });
});
