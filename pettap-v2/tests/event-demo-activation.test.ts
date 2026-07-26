import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildEventDemoPhotoPath } from "@/features/event-demo/services/event-demo-photo-storage";
import { EventDemoPhotoService } from "@/features/event-demo/services/event-demo-photo-service";

const root = process.cwd();
const actionSource = readFileSync(resolve(root, "features/event-demo/actions/event-demo-actions.ts"), "utf8");
const pageSource = readFileSync(resolve(root, "app/event/activate/[publicCode]/page.tsx"), "utf8");
const cookieSource = readFileSync(resolve(root, "features/event-demo/server/event-demo-cookie.ts"), "utf8");
const proxySource = readFileSync(resolve(root, "proxy.ts"), "utf8");

describe("Event Demo private photo storage", () => {
  it("uses a UUID-segregated, non-predictable temporary path", () => {
    const path = buildEventDemoPhotoPath("c23e44bd-a981-4d2a-8f19-cd863a8fce9d", "d47a57ae-5c4e-4d79-9b68-ffdc70b8d181");
    expect(path).toMatch(/^event-demo\/c23e44bd-a981-4d2a-8f19-cd863a8fce9d\/d47a57ae-5c4e-4d79-9b68-ffdc70b8d181\/[0-9a-f-]+\.webp$/);
    expect(() => buildEventDemoPhotoPath("../tag", "session")).toThrow();
  });

  it("replaces a photo before deleting the previous private object", async () => {
    const session = { id: "d47a57ae-5c4e-4d79-9b68-ffdc70b8d181", demoTagId: "c23e44bd-a981-4d2a-8f19-cd863a8fce9d", photoStoragePath: "event-demo/old.webp" };
    const sessions = { getOwnedSession: vi.fn().mockResolvedValue(session) };
    const repository = { update: vi.fn().mockResolvedValue(session) };
    const storage = { uploadTemporaryPhoto: vi.fn(), deleteTemporaryPhoto: vi.fn().mockResolvedValue({ ok: true }), createPreviewUrl: vi.fn().mockResolvedValue("https://signed.example/photo") };
    const audit = { record: vi.fn() };
    const service = new EventDemoPhotoService(sessions, repository, storage, audit);
    const file = new File(["image"], "pet.png", { type: "image/png" });
    await expect(service.replaceOwnedPhoto("ed_123456789012345678901234", "token", file)).resolves.toEqual({ previewUrl: "https://signed.example/photo" });
    expect(storage.uploadTemporaryPhoto).toHaveBeenCalledBefore(repository.update as never);
    expect(repository.update).toHaveBeenCalledBefore(storage.deleteTemporaryPhoto as never);
  });
});

describe("Event Demo activation protection contracts", () => {
  it("uses HttpOnly, scoped cookies and never places the token in a URL", () => {
    expect(cookieSource).toContain("httpOnly: true");
    expect(cookieSource).toContain('path: "/event"');
    expect(cookieSource).toContain("sameSite: \"lax\"");
    expect(pageSource).not.toContain("token=");
    expect(actionSource).toContain("readEventDemoCookie");
  });

  it("keeps activation private, noindexed and non-cacheable", () => {
    expect(pageSource).toContain("index: false, follow: false");
    expect(proxySource).toContain('"Cache-Control", "private, no-store"');
    expect(proxySource).toContain('"X-Robots-Tag", "noindex, nofollow"');
  });

  it("rate-limits public actions and never returns a token hash or storage path", () => {
    expect(actionSource).toContain("checkRateLimit");
    expect(actionSource).not.toContain("sessionTokenHash");
    expect(actionSource).not.toContain("photoStoragePath:");
  });
});
