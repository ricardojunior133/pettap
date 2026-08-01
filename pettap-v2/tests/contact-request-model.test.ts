import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { contactRequests } from "@/db/schema";

describe("Contact Request foundation",()=>{
  const migration=readFileSync(resolve(process.cwd(),"db/migrations/0015_contact_requests.sql"),"utf8");
  it("creates the private lifecycle, constraints, foreign keys and RLS",()=>{expect(migration).toContain('CREATE TYPE "public"."contact_request_status"');expect(migration).toContain('CREATE TABLE "contact_requests"');expect(migration).toContain('contact_requests_lost_report_id_lost_reports_id_fk');expect(migration).toContain('ENABLE ROW LEVEL SECURITY');expect(migration).toContain('contact_requests_owner_select');expect(migration).toContain('REVOKE ALL ON TABLE "contact_requests" FROM anon')});
  it("models only private contact request fields with owner-safe foreign keys",()=>{const config=getTableConfig(contactRequests);expect(contactRequests.actorHash.name).toBe("actor_hash");expect(config.foreignKeys.map(key=>key.getName())).toEqual(expect.arrayContaining(["contact_requests_lost_report_id_lost_reports_id_fk","contact_requests_pet_id_pets_id_fk","contact_requests_tag_id_nfc_tags_id_fk"]));expect(config.indexes.map(index=>index.config.name)).toEqual(expect.arrayContaining(["contact_requests_lost_report_idx","contact_requests_tag_status_created_idx","contact_requests_pet_status_created_idx"]))});
});
