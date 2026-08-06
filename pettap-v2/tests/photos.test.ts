import { describe, expect, it } from "vitest";

import { MAX_PHOTOS_PER_PET } from "@/features/photos/constants";
import type { PhotoRepository } from "@/features/photos/repositories/photo-repository";
import { PhotoLimitError, PhotoService } from "@/features/photos/services/photo-service";
import { buildPetPhotoPath, InvalidPhotoError, type StorageService, validatePhotoFile } from "@/features/photos/services/storage-service";
import type { StoredPetPhoto } from "@/features/photos/types/photo";
import { getAuthorizedPet, PetAccessError } from "@/features/pets/services/pet-access";
import type { PetRepository } from "@/features/pets/repositories/pet-repository";

const accountId = "8b95f64c-4b42-4b9b-a656-33d856f9e363";
const petId = "ab89f4ac-a86b-424e-963a-2f5720811c30";
const photoId = "bb89f4ac-a86b-424e-963a-2f5720811c30";

function storedPhoto(overrides: Partial<StoredPetPhoto> = {}): StoredPetPhoto {
  return { id: photoId, petId, storagePath: `${accountId}/${petId}/${photoId}.webp`, isPrimary: true, createdAt: new Date("2026-01-01"), ...overrides };
}

function repository(overrides: Partial<PhotoRepository> = {}): PhotoRepository {
  return {
    async listPetPhotos() { return [storedPhoto()]; },
    async findPhoto() { return storedPhoto(); },
    async insertPhoto(input) { return storedPhoto({ id: input.id, storagePath: input.storagePath, isPrimary: input.isPrimary }); },
    async deletePhoto() { return storedPhoto(); },
    async updatePrimaryPhoto() { return storedPhoto(); },
    async countPetPhotos() { return 0; },
    ...overrides,
  };
}

function storage(deleted: string[] = []): StorageService {
  return {
    async uploadPhoto() {},
    async deletePhoto(path) { deleted.push(path); },
    async createSignedUrl(path) { return `https://example.test/${path}`; },
  };
}

const authorize = async () => ({ accountId, petId });

describe("pet photo validation", () => {
  it("builds server-owned storage paths", () => {
    expect(buildPetPhotoPath(accountId, petId, photoId)).toBe(`${accountId}/${petId}/${photoId}.webp`);
    expect(() => buildPetPhotoPath("../account", petId, photoId)).toThrow(InvalidPhotoError);
  });

  it("rejects unsupported MIME types and oversized files", () => {
    expect(() => validatePhotoFile({ name: "photo.gif", type: "image/gif", size: 100 } as File)).toThrow(InvalidPhotoError);
    expect(() => validatePhotoFile({ name: "photo.png", type: "image/png", size: 5 * 1024 * 1024 + 1 } as File)).toThrow(InvalidPhotoError);
    expect(() => validatePhotoFile({ name: "photo.jpg", type: "image/png", size: 100 } as File)).toThrow(InvalidPhotoError);
  });

  it("creates signed URLs without exposing storage paths", async () => {
    const photos = await new PhotoService(repository(), storage(), authorize).listPhotos(petId);
    expect(photos[0].signedUrl).toContain("https://example.test/");
    expect(photos[0]).not.toHaveProperty("storagePath");
  });

  it("enforces the photo limit before upload", async () => {
    const service = new PhotoService(repository({ async countPetPhotos() { return MAX_PHOTOS_PER_PET; } }), storage(), authorize);
    await expect(service.uploadPhoto(petId, { type: "image/png", size: 100 } as File)).rejects.toThrow(PhotoLimitError);
  });

  it("rolls back storage when the photo database insert fails", async () => {
    const deleted: string[] = [];
    const service = new PhotoService(repository({ async insertPhoto() { throw new Error("database unavailable"); } }), storage(deleted), authorize);
    await expect(service.uploadPhoto(petId, { type: "image/png", size: 100 } as File)).rejects.toThrow("database unavailable");
    expect(deleted).toHaveLength(1);
  });

  it("keeps a valid upload when signing the immediate preview fails", async () => {
    const deleted: string[] = [];
    const service = new PhotoService(repository(), { ...storage(deleted), async createSignedUrl() { throw new Error("signing unavailable"); } }, authorize);
    await expect(service.uploadPhoto(petId, { type: "image/png", size: 100 } as File)).rejects.toThrow("signing unavailable");
    expect(deleted).toEqual([]);
  });

  it("passes the authenticated account scope to private repository operations", async () => {
    const calls: unknown[][] = [];
    const scopedRepository = repository({
      async listPetPhotos(...args) { calls.push(args); return [storedPhoto()]; },
    });
    await new PhotoService(scopedRepository, storage(), authorize).listPhotos(petId);
    expect(calls[0]).toEqual([petId, accountId]);
  });
});

describe("pet ownership access", () => {
  it("does not reveal a pet owned by another account", async () => {
    const pets: PetRepository = {
      async listPetsByAccount() { return []; }, async countPetsByAccount() { return 0; },
      async findPetByIdAndAccount() { return null; }, async createPetForAccount() { throw new Error("unused"); },
      async updatePetForAccount() { return null; }, async deletePetForAccount() { return false; },
    };
    await expect(getAuthorizedPet(petId, pets, async () => accountId)).rejects.toThrow(PetAccessError);
  });
});
