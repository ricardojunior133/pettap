import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { eventDemoConsentSchema, eventDemoPetDataSchema, eventDemoVisibilityPreferencesSchema, leadSchema } from "@/features/event-demo/schemas/event-demo";
import { LeadService, MarketingConsentRequiredError, normalizeLeadEmail } from "@/features/event-demo/services/lead-service";
import { EventDemoSessionService } from "@/features/event-demo/services/event-demo-session-service";
import { generateEventDemoPublicCode, generateEventDemoPublicId, generateEventDemoSessionToken, hashEventDemoSessionToken, verifyEventDemoSessionToken } from "@/features/event-demo/security/tokens";

const migration = readFileSync(resolve(process.cwd(), "db/migrations/0011_event_demo_foundation.sql"), "utf8");

describe("Event Demo secure identifiers", () => {
  it("creates route-safe, non-sequential public identifiers", () => {
    const publicCode = generateEventDemoPublicCode();
    const publicId = generateEventDemoPublicId();
    expect(publicCode).toMatch(/^demo_[A-Za-z0-9_-]{16}$/);
    expect(publicId).toMatch(/^ed_[A-Za-z0-9_-]{24}$/);
    expect(new Set(Array.from({ length: 20 }, generateEventDemoPublicId)).size).toBe(20);
  });

  it("hashes and verifies an opaque session token without persisting the token", () => {
    const token = generateEventDemoSessionToken();
    const hash = hashEventDemoSessionToken(token);
    expect(hash).not.toBe(token);
    expect(verifyEventDemoSessionToken(token, hash)).toBe(true);
    expect(verifyEventDemoSessionToken(`${token}x`, hash)).toBe(false);
  });
});

describe("Event Demo validation", () => {
  it("enforces session duration and field limits", async () => {
    const repository = { create: vi.fn(), findByPublicCode: vi.fn().mockResolvedValue(null) };
    const { EventDemoTagService } = await import("@/features/event-demo/services/event-demo-tag-service");
    const service = new EventDemoTagService(repository);
    await expect(service.create({ internalName: "Demo 01", sessionDurationMinutes: 9 })).rejects.toThrow();
    await expect(service.create({ internalName: "x".repeat(101), sessionDurationMinutes: 60 })).rejects.toThrow();
  });

  it("normalizes optional pet fields and preserves safe private defaults", () => {
    const pet = eventDemoPetDataSchema.parse({ petName: "  Charlie  ", breed: " ", personality: "Friendly" });
    expect(pet).toMatchObject({ petName: "Charlie", breed: null, personality: "Friendly" });
    expect(eventDemoPetDataSchema.safeParse({ petName: "x".repeat(61) }).success).toBe(false);
    expect(eventDemoVisibilityPreferencesSchema.parse({})).toEqual({ showOwnerFirstName: false, showTelephone: false, showEmail: false, showBreed: false, showAge: false, showPersonality: false });
    expect(eventDemoConsentSchema.safeParse({ demoConsentAccepted: false, demoConsentVersion: "v1" }).success).toBe(false);
  });
});

describe("Event Demo sessions", () => {
  it("identifies expired and deleted sessions", async () => {
    const service = new EventDemoSessionService({ startForTag: vi.fn(), findById: vi.fn(), findByPublicId: vi.fn(), findLatestByTagId: vi.fn(), update: vi.fn(), expireWithTag: vi.fn(), completeWithTag: vi.fn(), finalizeCleanup: vi.fn(), listExpiredCandidates: vi.fn() }, undefined, undefined, undefined, undefined, { resetToAvailable: vi.fn() });
    const base = { expiresAt: new Date("2026-07-26T10:00:00.000Z"), status: "started" as const, deletedAt: null };
    await expect(service.isExpired(base, new Date("2026-07-26T10:00:01.000Z"))).resolves.toBe(true);
    await expect(service.isExpired({ ...base, expiresAt: new Date("2026-07-26T10:01:00.000Z") }, new Date("2026-07-26T10:00:00.000Z"))).resolves.toBe(false);
    await expect(service.isExpired({ ...base, deletedAt: new Date() }, new Date("2026-07-26T09:00:00.000Z"))).resolves.toBe(true);
  });

});

describe("Event Demo leads", () => {
  it("normalizes email and blocks marketing lead creation without consent", async () => {
    expect(normalizeLeadEmail("  HELLO@EXAMPLE.COM ")).toBe("hello@example.com");
    expect(leadSchema.parse({ email: "  HELLO@EXAMPLE.COM ", source: "event_demo", marketingConsent: true }).email).toBe("hello@example.com");
    const repository = { upsertByEmail: vi.fn() };
    const service = new LeadService(repository);
    await expect(service.upsertMarketingLead({ email: "hello@example.com", firstName: null, source: "event_demo", marketingConsent: false, consentVersion: null })).rejects.toBeInstanceOf(MarketingConsentRequiredError);
  });
});

describe("Event Demo migration contract", () => {
  it("creates private, indexed tables and idempotent RBAC permissions", () => {
    for (const table of ["event_demo_tags", "event_demo_sessions", "leads"]) expect(migration).toContain(`CREATE TABLE \"${table}\"`);
    for (const index of ["event_demo_tags_public_code_unique", "event_demo_sessions_public_id_unique", "leads_email_normalized_unique"]) expect(migration).toContain(index);
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("REVOKE ALL ON TABLE \"event_demo_sessions\" FROM anon, authenticated");
    expect(migration).toContain("'event_demo.view'");
    expect(migration).toContain("'event_demo.manage'");
  });
});
