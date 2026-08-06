import "server-only";

import sharp from "sharp";

import { createSupabaseServerClient } from "@/lib/backend/supabase/server";

import {
  ACCEPTED_PHOTO_MIME_TYPES,
  ACCEPTED_PHOTO_EXTENSIONS,
  MAX_PHOTO_SIZE,
  PET_PHOTOS_BUCKET,
  SIGNED_URL_TTL_SECONDS,
  type AcceptedPhotoMimeType,
} from "../constants";

export class PhotoStorageError extends Error {}
export class InvalidPhotoError extends Error {}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildPetPhotoPath(accountId: string, petId: string, photoId: string) {
  if (![accountId, petId, photoId].every((value) => UUID_PATTERN.test(value))) {
    throw new InvalidPhotoError("Photo storage could not be prepared.");
  }

  return `${accountId}/${petId}/${photoId}.webp`;
}

export function validatePhotoFile(file: File): asserts file is File & { type: AcceptedPhotoMimeType } {
  if (!ACCEPTED_PHOTO_MIME_TYPES.includes(file.type as AcceptedPhotoMimeType)) {
    throw new InvalidPhotoError("Upload a JPG, PNG, or WebP image.");
  }

  if (file.size === 0 || file.size > MAX_PHOTO_SIZE) {
    throw new InvalidPhotoError("This image is too large. Please choose a file smaller than 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ACCEPTED_PHOTO_EXTENSIONS[file.type as AcceptedPhotoMimeType].includes(extension)) {
    throw new InvalidPhotoError("The image file type does not match its extension.");
  }
}

export interface StorageService {
  uploadPhoto(path: string, file: File): Promise<void>;
  deletePhoto(path: string): Promise<void>;
  createSignedUrl(path: string): Promise<string>;
}

export class SupabaseStorageService implements StorageService {
  async uploadPhoto(path: string, file: File): Promise<void> {
    validatePhotoFile(file);
    const source = Buffer.from(await file.arrayBuffer());
    let optimized: Buffer;

    try {
      optimized = await sharp(source).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    } catch {
      throw new InvalidPhotoError("We couldn’t read that image. Please choose a different photo.");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.storage.from(PET_PHOTOS_BUCKET).upload(path, optimized, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: "31536000",
    });

    if (error) throw new PhotoStorageError("Photo upload failed.");
  }

  async deletePhoto(path: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.storage.from(PET_PHOTOS_BUCKET).remove([path]);
    if (error) throw new PhotoStorageError("Photo deletion failed.");
  }

  async createSignedUrl(path: string): Promise<string> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(PET_PHOTOS_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) throw new PhotoStorageError("Photo preview could not be prepared.");
    return data.signedUrl;
  }
}
