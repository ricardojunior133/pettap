import { describe, expect, it, vi } from "vitest";

import type { EventDemoSession } from "@/db/schema";
import { EventDemoDomainError } from "@/features/event-demo/domain/errors";
import { assertEventDemoSessionTransition, assertEventDemoTagTransition } from "@/features/event-demo/domain/state-machine";
import { EventDemoSessionService } from "@/features/event-demo/services/event-demo-session-service";
import { hashEventDemoSessionToken } from "@/features/event-demo/security/tokens";

const now = new Date("2026-07-26T12:00:00.000Z");
function session(overrides: Partial<EventDemoSession> = {}): EventDemoSession {
  return {
    id: "d47a57ae-5c4e-4d79-9b68-ffdc70b8d181", publicId: "ed_123456789012345678901234", demoTagId: "c23e44bd-a981-4d2a-8f19-cd863a8fce9d", sessionTokenHash: "a".repeat(64), status: "started", expiresAt: new Date("2026-07-26T13:00:00.000Z"), completedAt: null, deletedAt: null,
    petName: null, species: null, breed: null, age: null, personality: null, ownerFirstName: null, contactTelephone: null, contactEmail: null, photoStoragePath: null,
    showOwnerFirstName: false, showTelephone: false, showEmail: false, showBreed: false, showAge: false, showPersonality: false,
    demoConsentAccepted: false, demoConsentVersion: null, demoConsentAcceptedAt: null, marketingConsent: false, marketingConsentVersion: null, marketingConsentAt: null, createdAt: now, updatedAt: now,
    ...overrides,
  };
}

function repository(overrides: Record<string, unknown> = {}) {
  return {
    startForTag: vi.fn(), findById: vi.fn(), findByPublicId: vi.fn(), findLatestByTagId: vi.fn(), update: vi.fn(), expireWithTag: vi.fn(), completeWithTag: vi.fn(), finalizeCleanup: vi.fn(), listExpiredCandidates: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function makeService(repo = repository(), storage = { deleteTemporaryPhoto: vi.fn().mockResolvedValue({ ok: true }) }, authorize = vi.fn().mockResolvedValue(undefined), tags = { resetToAvailable: vi.fn().mockResolvedValue({ id: "tag" }) }) {
  const leads = { upsertMarketingLead: vi.fn() };
  const audit = { record: vi.fn().mockResolvedValue(undefined) };
  return { service: new EventDemoSessionService(repo, storage, leads, audit, authorize, tags), repo, storage, leads, audit, authorize, tags };
}

describe("Event Demo state machine", () => {
  it("allows only declared transitions", () => {
    expect(() => assertEventDemoTagTransition("available", "in_progress")).not.toThrow();
    expect(() => assertEventDemoTagTransition("disabled", "in_progress")).toThrow(EventDemoDomainError);
    expect(() => assertEventDemoSessionTransition("started", "profile_created")).not.toThrow();
    expect(() => assertEventDemoSessionTransition("started", "completed")).toThrow(EventDemoDomainError);
  });
});

describe("Event Demo session lifecycle", () => {
  it("starts a session atomically and returns a token that is not persisted", async () => {
    const created = session();
    const { service, repo } = makeService(repository({ startForTag: vi.fn().mockResolvedValue({ kind: "started", session: created }) }));
    const result = await service.startSessionForTag(created.demoTagId, now);
    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(repo.startForTag).toHaveBeenCalledWith(expect.objectContaining({ demoTagId: created.demoTagId, sessionTokenHash: expect.not.stringMatching(result.token) }));
    expect(result.session).not.toHaveProperty("sessionTokenHash");
  });

  it("rejects disabled and occupied tags without exposing a session", async () => {
    const disabled = makeService(repository({ startForTag: vi.fn().mockResolvedValue({ kind: "tag_disabled" }) }));
    await expect(disabled.service.startSessionForTag("c23e44bd-a981-4d2a-8f19-cd863a8fce9d", now)).rejects.toMatchObject({ code: "tag_disabled" });
    const busy = makeService(repository({ startForTag: vi.fn().mockResolvedValue({ kind: "tag_unavailable" }) }));
    await expect(busy.service.startSessionForTag("c23e44bd-a981-4d2a-8f19-cd863a8fce9d", now)).rejects.toMatchObject({ code: "tag_unavailable" });
  });

  it("rejects an invalid token before returning session data", async () => {
    const current = session({ sessionTokenHash: "b".repeat(64) });
    const { service } = makeService(repository({ findByPublicId: vi.fn().mockResolvedValue(current) }));
    await expect(service.verifySessionAccess(current.publicId, "wrong-token", now)).rejects.toMatchObject({ code: "invalid_session_token" });
  });

  it("rejects a visibility preference without the matching field", async () => {
    const current = session({ sessionTokenHash: hashEventDemoSessionToken("valid-token") });
    const { service } = makeService(repository({ findByPublicId: vi.fn().mockResolvedValue(current) }));
    await expect(service.updateOwnedSession(current.publicId, "valid-token", { visibility: { showOwnerFirstName: false, showTelephone: true, showEmail: false, showBreed: false, showAge: false, showPersonality: false } }, now)).rejects.toMatchObject({ code: "invalid_state_transition" });
  });

  it("requires demo consent before profile completion", async () => {
    const current = session({ sessionTokenHash: hashEventDemoSessionToken("valid-token"), petName: "Charlie", species: "dog" });
    const { service } = makeService(repository({ findByPublicId: vi.fn().mockResolvedValue(current) }));
    await expect(service.markProfileCreated(current.publicId, "valid-token", now)).rejects.toMatchObject({ code: "consent_required" });
  });

  it("requires a future real photo before completion and upserts a consented lead only once", async () => {
    const current = session({ status: "profile_created", sessionTokenHash: hashEventDemoSessionToken("valid-token"), petName: "Charlie", species: "dog", demoConsentAccepted: true, demoConsentVersion: "v1", demoConsentAcceptedAt: now, marketingConsent: true, marketingConsentVersion: "v1" });
    const pending = makeService(repository({ findByPublicId: vi.fn().mockResolvedValue(current) }));
    await expect(pending.service.completeOwnedSession(current.publicId, "valid-token", "event_demo", now)).rejects.toMatchObject({ code: "photo_pending" });

    const ready = { ...current, photoStoragePath: "event-demo/photo.webp", contactEmail: "owner@example.com" };
    const completed = { ...ready, status: "completed" as const, completedAt: now };
    const repo = repository({ findByPublicId: vi.fn().mockResolvedValue(ready), completeWithTag: vi.fn().mockResolvedValue(completed) });
    const { service, leads, audit } = makeService(repo);
    await expect(service.completeOwnedSession(ready.publicId, "valid-token", "event_demo", now)).resolves.toMatchObject({ status: "completed" });
    expect(leads.upsertMarketingLead).toHaveBeenCalledWith(expect.objectContaining({ email: "owner@example.com", source: "event_demo", marketingConsent: true }), now);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "event_demo.lead_created", metadata: expect.not.objectContaining({ email: expect.anything() }) }));
  });

  it("expires then clears PII only after a successful storage deletion", async () => {
    const expired = session({ status: "expired", expiresAt: new Date("2026-07-26T11:00:00.000Z"), photoStoragePath: "event-demo/a.webp", petName: "Charlie", contactEmail: "owner@example.com" });
    const repo = repository({ findById: vi.fn().mockResolvedValue(expired), finalizeCleanup: vi.fn().mockResolvedValue(session({ ...expired, status: "deleted", deletedAt: now, petName: null, contactEmail: null, photoStoragePath: null })) });
    const { service, storage } = makeService(repo);
    await expect(service.cleanupExpiredSession(expired.id, now)).resolves.toEqual({ status: "cleaned" });
    expect(storage.deleteTemporaryPhoto).toHaveBeenCalledWith("event-demo/a.webp");
    expect(repo.finalizeCleanup).toHaveBeenCalledWith(expired.id, now);
  });

  it("keeps the session recoverable when Storage deletion fails", async () => {
    const expired = session({ status: "expired", photoStoragePath: "event-demo/a.webp" });
    const repo = repository({ findById: vi.fn().mockResolvedValue(expired) });
    const { service } = makeService(repo, { deleteTemporaryPhoto: vi.fn().mockResolvedValue({ ok: false, errorCode: "storage_timeout" }) });
    await expect(service.cleanupExpiredSession(expired.id, now)).resolves.toEqual({ status: "failed", errorCode: "storage_timeout" });
    expect(repo.finalizeCleanup).not.toHaveBeenCalled();
  });

  it("processes an expired batch with bounded counts", async () => {
    const expired = session({ expiresAt: new Date("2026-07-26T11:00:00.000Z") });
    const repo = repository({ listExpiredCandidates: vi.fn().mockResolvedValue([expired]), findById: vi.fn().mockResolvedValue(expired), expireWithTag: vi.fn().mockResolvedValue({ ...expired, status: "expired" }), finalizeCleanup: vi.fn().mockResolvedValue({ ...expired, status: "deleted", deletedAt: now }) });
    const { service } = makeService(repo);
    await expect(service.cleanupExpiredDemoSessions(10, now)).resolves.toEqual({ inspected: 1, expired: 1, cleaned: 1, failed: 0 });
  });

  it("authorizes and records an idempotent administrative reset", async () => {
    const deleted = session({ status: "deleted", deletedAt: now });
    const { service, authorize, tags } = makeService(repository({ findLatestByTagId: vi.fn().mockResolvedValue(deleted) }));
    await expect(service.resetDemoTag(deleted.demoTagId, now)).resolves.toEqual({ status: "already_clean" });
    expect(authorize).toHaveBeenCalledOnce();
    expect(tags.resetToAvailable).toHaveBeenCalledWith(deleted.demoTagId, now);
  });
});
