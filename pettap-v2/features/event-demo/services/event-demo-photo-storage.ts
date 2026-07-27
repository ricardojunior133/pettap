import "server-only";

import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

import { getServerEnv } from "@/lib/backend/env";

import { EVENT_DEMO_MAX_UPLOAD_SIZE, EVENT_DEMO_PHOTO_BUCKET, EVENT_DEMO_SIGNED_URL_SECONDS } from "../constants/config";
import type { EventDemoTemporaryStorage, TemporaryPhotoDeletionResult } from "./event-demo-temporary-storage";

export class EventDemoPhotoError extends Error {}
export class EventDemoPhotoMissingError extends EventDemoPhotoError {}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export function buildEventDemoPhotoPath(demoTagId: string, sessionId: string): string {
  if (!uuidPattern.test(demoTagId) || !uuidPattern.test(sessionId)) throw new EventDemoPhotoError("Photo storage could not be prepared.");
  return `event-demo/${demoTagId}/${sessionId}/${randomUUID()}.webp`;
}

function assertPhotoInput(file: File) {
  if (!allowedMimeTypes.has(file.type) || file.size <= 0 || file.size > EVENT_DEMO_MAX_UPLOAD_SIZE) throw new EventDemoPhotoError("Choose a JPG, PNG, WebP, HEIC or HEIF image smaller than 6 MB.");
  if (["image/svg+xml", "image/gif"].includes(file.type)) throw new EventDemoPhotoError("Choose a JPG, PNG, WebP, HEIC or HEIF image.");
}

function adminStorageClient() {
  const env = getServerEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface EventDemoPhotoStorage extends EventDemoTemporaryStorage {
  uploadTemporaryPhoto(path: string, file: File): Promise<void>;
  createPreviewUrl(path: string): Promise<string>;
}

export class SupabaseEventDemoPhotoStorage implements EventDemoPhotoStorage {
  async uploadTemporaryPhoto(path: string, file: File): Promise<void> {
    assertPhotoInput(file);
    let optimized: Buffer;
    try {
      optimized = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 })
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
    } catch {
      throw new EventDemoPhotoError("We couldn't read that image. Please choose a different photo.");
    }
    const { error } = await adminStorageClient().storage.from(EVENT_DEMO_PHOTO_BUCKET).upload(path, optimized, { contentType: "image/webp", cacheControl: "private, max-age=0", upsert: false });
    if (error) throw new EventDemoPhotoError("Photo upload could not be completed.");
  }

  async deleteTemporaryPhoto(path: string): Promise<TemporaryPhotoDeletionResult> {
    if (!path.startsWith("event-demo/")) return { ok: false, errorCode: "invalid_temporary_path" };
    const { error } = await adminStorageClient().storage.from(EVENT_DEMO_PHOTO_BUCKET).remove([path]);
    return error ? { ok: false, errorCode: "temporary_photo_delete_failed" } : { ok: true };
  }

  async createPreviewUrl(path: string): Promise<string> {
    if (!path.startsWith("event-demo/")) throw new EventDemoPhotoError("Photo preview could not be prepared.");
    const separatorIndex = path.lastIndexOf("/");
    const directory = path.slice(0, separatorIndex);
    const filename = path.slice(separatorIndex + 1);
    const storage = adminStorageClient().storage.from(EVENT_DEMO_PHOTO_BUCKET);
    const { data: files, error: listError } = await storage.list(directory, { limit: 1, search: filename });
    if (listError) throw new EventDemoPhotoError("Photo preview could not be prepared.");
    if (!files?.some((file) => file.name === filename)) throw new EventDemoPhotoMissingError("Photo is no longer available.");
    const { data, error } = await storage.createSignedUrl(path, EVENT_DEMO_SIGNED_URL_SECONDS);
    if (error || !data?.signedUrl) throw new EventDemoPhotoError("Photo preview could not be prepared.");
    return data.signedUrl;
  }
}
