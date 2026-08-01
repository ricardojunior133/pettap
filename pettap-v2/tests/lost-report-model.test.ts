import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { lostReports } from "@/db/schema";

type Report = { petId: string; tagId: string | null; status: "open" | "closed" };

// Mirrors the two partial unique indexes. It is intentionally test-only: the
// database remains the source of truth for concurrent writes.
function canOpenReport(existing: Report[], next: Report) {
  return !existing.some((report) => report.status === "open" && (
    report.petId === next.petId || (next.tagId !== null && report.tagId === next.tagId)
  ));
}

describe("canonical Lost Mode data model", () => {
  const migration = readFileSync(resolve(process.cwd(), "db/migrations/0014_canonical_lost_mode_data_model.sql"), "utf8");

  it("preserves legacy reports while adding canonical ownership and lifecycle fields", () => {
    expect(migration).toContain('ADD COLUMN "tag_id" uuid');
    expect(migration).toContain('ADD COLUMN "actor_account_id" uuid');
    expect(migration).toContain('UPDATE "lost_reports" SET "opened_at" = "created_at"');
    expect(migration).toContain('ALTER COLUMN "opened_at" SET NOT NULL');
    expect(migration).toContain('ALTER COLUMN "opened_at" SET DEFAULT now()');
    expect(migration).toContain('NOT VALID checks');
  });

  it("contains the required FKs and partial unique constraints", () => {
    expect(migration).toContain('lost_reports_tag_id_nfc_tags_id_fk');
    expect(migration).toContain('lost_reports_actor_account_id_accounts_id_fk');
    expect(migration).toContain('lost_reports_one_open_per_pet_idx');
    expect(migration).toContain('lost_reports_one_open_per_tag_idx');
    expect(migration).toContain('WHERE "lost_reports"."status" = \'open\' AND "lost_reports"."tag_id" IS NOT NULL');
    expect(migration).toContain('lost_reports_status_open_or_closed');
    expect(migration).toContain('NOT VALID');
  });

  it("models tags, actors, timestamps and both open-report indexes in TypeScript", () => {
    const config = getTableConfig(lostReports);
    expect(lostReports.tagId.name).toBe("tag_id");
    expect(lostReports.actorAccountId.name).toBe("actor_account_id");
    expect(lostReports.openedAt.name).toBe("opened_at");
    expect(lostReports.closedAt.name).toBe("closed_at");
    expect(config.foreignKeys.map((key) => key.getName())).toEqual(expect.arrayContaining([
      "lost_reports_tag_id_nfc_tags_id_fk",
      "lost_reports_actor_account_id_accounts_id_fk",
    ]));
    expect(config.indexes.map((index) => index.config.name)).toEqual(expect.arrayContaining([
      "lost_reports_one_open_per_pet_idx",
      "lost_reports_one_open_per_tag_idx",
    ]));
  });

  it("allows an opening, blocks a second open report, and permits a new one after closure", () => {
    const first: Report = { petId: "pet-a", tagId: "tag-a", status: "open" };
    expect(canOpenReport([], first)).toBe(true);
    expect(canOpenReport([first], { petId: "pet-a", tagId: "tag-b", status: "open" })).toBe(false);
    expect(canOpenReport([first], { petId: "pet-b", tagId: "tag-a", status: "open" })).toBe(false);
    expect(canOpenReport([{ ...first, status: "closed" }], { ...first, status: "open" })).toBe(true);
  });
});
