import { describe, expect, it, vi } from "vitest";

import { EventDemoPublicProfileService } from "@/features/event-demo/services/event-demo-public-profile-service";
import { EventDemoPhotoError, EventDemoPhotoMissingError } from "@/features/event-demo/services/event-demo-photo-storage";
import type { EventDemoSession } from "@/db/schema";

const now = new Date("2026-07-26T13:00:00.000Z");
const baseSession: EventDemoSession = {
  id: "d47a57ae-5c4e-4d79-9b68-ffdc70b8d181", publicId: "ed_123456789012345678901234", demoTagId: "c23e44bd-a981-4d2a-8f19-cd863a8fce9d", sessionTokenHash: "secret-hash", status: "completed" as const, expiresAt: new Date("2026-07-26T14:00:00.000Z"), completedAt: now, deletedAt: null,
  petName: "Charlie", species: "dog" as const, breed: "Pug", age: "3", personality: "Friendly", ownerFirstName: "Alex", contactTelephone: "+44123456789", contactEmail: "alex@example.com", photoStoragePath: "event-demo/private.webp",
  showOwnerFirstName: true, showTelephone: false, showEmail: false, showBreed: true, showAge: true, showPersonality: true,
  demoConsentAccepted: true, demoConsentVersion: "v1", demoConsentAcceptedAt: now, marketingConsent: false, marketingConsentVersion: null, marketingConsentAt: null, createdAt: now, updatedAt: now,
};

function service(session: EventDemoSession | null, photo = "https://signed.example/photo") {
  const repository = { findByPublicId: vi.fn().mockResolvedValue(session) };
  const lifecycle = { expireSessionIfNeeded: vi.fn(), cleanupExpiredSession: vi.fn() };
  const storage = { createPreviewUrl: vi.fn().mockResolvedValue(photo) };
  const audit = { record: vi.fn() };
  return { service: new EventDemoPublicProfileService(repository, lifecycle, storage, audit), repository, lifecycle, storage, audit };
}

describe("Event Demo public profile DTO", () => {
  it("filters every private field server-side before returning the profile", async () => {
    const { service: resolver } = service(baseSession);
    const result = await resolver.resolve(baseSession.publicId, now);
    expect(result).toMatchObject({ kind: "profile", profile: { petName: "Charlie", breed: "Pug", photoSignedUrl: "https://signed.example/photo" } });
    if (result.kind !== "profile") throw new Error("Expected public profile");
    expect(result.profile).not.toHaveProperty("contactTelephone");
    expect(result.profile).not.toHaveProperty("contactEmail");
    expect(result.profile).not.toHaveProperty("sessionTokenHash");
    expect(result.profile).not.toHaveProperty("photoStoragePath");
    expect(result.profile).not.toHaveProperty("demoTagId");
  });

  it("returns a generic unavailable state for incomplete, deleted, or unknown sessions", async () => {
    await expect(service({ ...baseSession, status: "profile_created" }).service.resolve(baseSession.publicId, now)).resolves.toEqual({ kind: "unavailable" });
    await expect(service({ ...baseSession, status: "deleted", deletedAt: now }).service.resolve(baseSession.publicId, now)).resolves.toEqual({ kind: "unavailable" });
    await expect(service(null).service.resolve(baseSession.publicId, now)).resolves.toEqual({ kind: "unavailable" });
  });

  it("expires and cleans an expired profile before returning its generic state", async () => {
    const expired = { ...baseSession, expiresAt: new Date("2026-07-26T12:00:00.000Z") };
    const result = service(expired);
    await expect(result.service.resolve(expired.publicId, now)).resolves.toEqual({ kind: "expired" });
    expect(result.lifecycle.expireSessionIfNeeded).toHaveBeenCalledWith(expired.id, now);
    expect(result.lifecycle.cleanupExpiredSession).toHaveBeenCalledWith(expired.id, now);
  });

  it("records a view with IDs and status only", async () => {
    const result = service(baseSession);
    await result.service.resolve(baseSession.publicId, now);
    expect(result.audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "event_demo.profile_viewed", metadata: { demoTagId: baseSession.demoTagId, sessionId: baseSession.id, status: "completed", source: "event_demo" } }));
  });

  it("uses the photo fallback only when the persisted storage object is actually missing", async () => {
    const repository = { findByPublicId: vi.fn().mockResolvedValue(baseSession) };
    const lifecycle = { expireSessionIfNeeded: vi.fn(), cleanupExpiredSession: vi.fn() };
    const storage = { createPreviewUrl: vi.fn().mockRejectedValue(new EventDemoPhotoMissingError("missing")) };
    const audit = { record: vi.fn() };
    const resolver = new EventDemoPublicProfileService(repository, lifecycle, storage, audit);
    const result = await resolver.resolve(baseSession.publicId, now);
    expect(result).toMatchObject({ kind: "profile", profile: { photoSignedUrl: null } });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "event_demo.profile_viewed" }));
  });

  it("does not silently turn an unexpected signing failure into a photo fallback", async () => {
    const repository = { findByPublicId: vi.fn().mockResolvedValue(baseSession) };
    const lifecycle = { expireSessionIfNeeded: vi.fn(), cleanupExpiredSession: vi.fn() };
    const storage = { createPreviewUrl: vi.fn().mockRejectedValue(new EventDemoPhotoError("storage unavailable")) };
    const audit = { record: vi.fn() };
    const resolver = new EventDemoPublicProfileService(repository, lifecycle, storage, audit);
    await expect(resolver.resolve(baseSession.publicId, now)).rejects.toThrow("storage unavailable");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: "event_demo.error" }));
  });
});
