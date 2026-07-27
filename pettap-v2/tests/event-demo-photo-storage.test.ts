import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

const { createClient, upload, from } = vi.hoisted(() => {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({ upload }));
  const createClient = vi.fn(() => ({ storage: { from } }));
  return { createClient, upload, from };
});

vi.mock("@supabase/supabase-js", () => ({ createClient }));
vi.mock("@/lib/backend/env", () => ({
  getServerEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    DATABASE_URL: "postgresql://example.com/postgres",
    NEXT_PUBLIC_SITE_URL: "https://pettap.test",
    NEXT_PUBLIC_CONTACT_EMAIL: "hello@pettap.test",
  }),
}));

import { SupabaseEventDemoPhotoStorage } from "@/features/event-demo/services/event-demo-photo-storage";

const sourcePhoto = readFileSync(resolve(process.cwd(), "public/images/pets/charlie.jpg"));
const targetPath = "event-demo/c23e44bd-a981-4d2a-8f19-cd863a8fce9d/d47a57ae-5c4e-4d79-9b68-ffdc70b8d181/photo.webp";

describe("Event Demo WebP storage payload", () => {
  it("uploads the exact optimized WebP bytes as an ArrayBuffer", async () => {
    const expected = await sharp(sourcePhoto, { limitInputPixels: 25_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
    const file = new File([sourcePhoto], "charlie.jpg", { type: "image/jpeg" });

    await new SupabaseEventDemoPhotoStorage().uploadTemporaryPhoto(targetPath, file);

    expect(createClient).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("pet-photos");
    expect(upload).toHaveBeenCalledOnce();

    const [path, payload, options] = upload.mock.calls[0] ?? [];
    expect(path).toBe(targetPath);
    expect(payload).toBeInstanceOf(ArrayBuffer);
    expect(payload.byteLength).toBe(expected.byteLength);
    const uploadBytes = new Uint8Array(payload);
    expect([...uploadBytes.subarray(0, 12)]).toEqual([...expected.subarray(0, 12)]);
    await expect(sharp(uploadBytes).metadata()).resolves.toMatchObject({ format: "webp", width: 1080, height: 1080 });
    expect(options).toEqual({ contentType: "image/webp", cacheControl: "private, max-age=0", upsert: false });
  });
});
