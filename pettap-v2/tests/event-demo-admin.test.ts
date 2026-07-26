import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createEventDemoTagBatchSchema, createEventDemoTagSchema } from "@/features/event-demo/schemas/event-demo";

const service = readFileSync(resolve(process.cwd(), "features/event-demo/services/event-demo-admin-service.ts"), "utf8");
const tagsRoute = readFileSync(resolve(process.cwd(), "app/api/admin/event-demo/export/tags/route.ts"), "utf8");
const leadsRoute = readFileSync(resolve(process.cwd(), "app/api/admin/event-demo/export/leads/route.ts"), "utf8");

describe("Event Demo administration contracts", () => {
  it("validates small, predictable tag batches server-side", () => {
    expect(createEventDemoTagBatchSchema.parse({ internalNamePrefix: "Fair Demo", sessionDurationMinutes: 60, quantity: 20 }).quantity).toBe(20);
    expect(createEventDemoTagBatchSchema.safeParse({ internalNamePrefix: "Fair Demo", sessionDurationMinutes: 60, quantity: 21 }).success).toBe(false);
    expect(createEventDemoTagSchema.safeParse({ internalName: "", sessionDurationMinutes: 60 }).success).toBe(false);
  });

  it("uses separate server-side view and manage permissions", () => {
    expect(service).toContain('requireAdminPermission("event_demo.view")');
    expect(service).toContain('requireAdminPermission("event_demo.manage")');
    expect(service).toContain("hasActiveSession(tagId)");
  });

  it("keeps operational session views free of visitor PII", () => {
    const declaration = service.match(/export type EventDemoSessionAdminView = ([^\n]+)/)?.[1] ?? "";
    for (const privateField of ["petName", "ownerFirstName", "contactEmail", "contactTelephone", "photoStoragePath", "sessionTokenHash"]) expect(declaration).not.toContain(privateField);
  });

  it("exports only documented columns and protects spreadsheet formula prefixes", () => {
    for (const source of [tagsRoute, leadsRoute]) {
      expect(source).toContain("^[=+\\-@]");
      expect(source).toContain("Cache-Control");
      expect(source).toContain("private, no-store");
    }
    expect(tagsRoute).toContain("internal_name,public_code,activation_url,status,session_duration_minutes");
    expect(leadsRoute).toContain("first_name,email,source,consent_version,consented_at");
    expect(leadsRoute).not.toContain("phone");
  });
});
