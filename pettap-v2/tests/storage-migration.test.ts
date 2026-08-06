import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0002_pet_photo_storage_security.sql"), "utf8");

describe("pet photo Storage migration", () => {
  it("creates a private, constrained bucket", () => {
    expect(migration).toContain("'pet-photos'");
    expect(migration).toContain("false,");
    expect(migration).toContain("5242880,");
    expect(migration).toContain("'image/jpeg', 'image/png', 'image/webp'");
  });

  it("uses a path helper tied to the current account and pet", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.can_manage_pet_photo_path(object_name text)");
    expect(migration).toContain("SECURITY DEFINER");
    expect(migration).toContain("SET search_path = public");
    expect(migration).toContain("path_parts.folders[1] = (SELECT public.current_account_id())::text");
    expect(migration).toContain("p.id::text = path_parts.folders[2]");
  });

  it("contains owner-only policies and no anonymous or update policy", () => {
    expect(migration).toContain("pet_photos_select_own_account");
    expect(migration).toContain("pet_photos_insert_own_account");
    expect(migration).toContain("pet_photos_delete_own_account");
    expect(migration).not.toMatch(/TO anon\b/i);
    expect(migration).not.toMatch(/FOR UPDATE TO authenticated/i);
    expect(migration).not.toMatch(/USING \(true\)/i);
  });
});
