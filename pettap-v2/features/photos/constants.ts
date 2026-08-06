export const PET_PHOTOS_BUCKET = "pet-photos";
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
export const MAX_PHOTOS_PER_PET = 6;
export const SIGNED_URL_TTL_SECONDS = 60 * 10;

export const ACCEPTED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AcceptedPhotoMimeType = (typeof ACCEPTED_PHOTO_MIME_TYPES)[number];

export const ACCEPTED_PHOTO_EXTENSIONS: Record<AcceptedPhotoMimeType, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};
