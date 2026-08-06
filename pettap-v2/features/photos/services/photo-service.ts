import "server-only";

import { getAuthorizedPet, PetAccessError } from "@/features/pets/services/pet-access";

import { MAX_PHOTOS_PER_PET } from "../constants";
import { DrizzlePhotoRepository, type PhotoRepository } from "../repositories/photo-repository";
import type { PetPhoto } from "../types/photo";
import {
  buildPetPhotoPath,
  InvalidPhotoError,
  PhotoStorageError,
  SupabaseStorageService,
  type StorageService,
} from "./storage-service";

export class PhotoNotFoundError extends Error {}
export class PhotoLimitError extends Error {}

type PhotoPetAuthorizer = (petId: string) => Promise<{ accountId: string; petId: string }>;

function serializePhoto(photo: { id: string; isPrimary: boolean; createdAt: Date }, signedUrl: string): PetPhoto {
  return { id: photo.id, isPrimary: photo.isPrimary, createdAt: photo.createdAt.toISOString(), signedUrl };
}

export class PhotoService {
  constructor(
    private readonly repository: PhotoRepository = new DrizzlePhotoRepository(),
    private readonly storage: StorageService = new SupabaseStorageService(),
    private readonly resolveAuthorizedPet: PhotoPetAuthorizer = authorizePhotoPet,
  ) {}

  private async authorizePet(petId: string) {
    return this.resolveAuthorizedPet(petId);
  }

  async listPhotos(petId: string): Promise<PetPhoto[]> {
    const authorized = await this.authorizePet(petId);
    const photos = await this.repository.listPetPhotos(authorized.petId, authorized.accountId);

    return Promise.all(photos.map(async (photo) => serializePhoto(photo, await this.storage.createSignedUrl(photo.storagePath))));
  }

  async uploadPhoto(petId: string, file: File): Promise<PetPhoto> {
    const authorized = await this.authorizePet(petId);
    const count = await this.repository.countPetPhotos(authorized.petId, authorized.accountId);
    if (count >= MAX_PHOTOS_PER_PET) throw new PhotoLimitError(`You can upload up to ${MAX_PHOTOS_PER_PET} photos for each pet.`);

    const photoId = crypto.randomUUID();
    const storagePath = buildPetPhotoPath(authorized.accountId, authorized.petId, photoId);
    await this.storage.uploadPhoto(storagePath, file);

    const photo = await (async () => {
      try {
        return await this.repository.insertPhoto({
          id: photoId,
          petId: authorized.petId,
          accountId: authorized.accountId,
          storagePath,
          isPrimary: count === 0,
        });
      } catch (error) {
        try {
          await this.storage.deletePhoto(storagePath);
        } catch {
          // The original database error is safer and more useful to the caller.
        }
        throw error;
      }
    })();

    // A signing failure must not trigger storage cleanup: the database record and
    // private object are both valid, and a later page request can generate a URL.
    const signedUrl = await this.storage.createSignedUrl(storagePath);
    return serializePhoto(photo, signedUrl);
  }

  async setPrimaryPhoto(petId: string, photoId: string): Promise<PetPhoto> {
    const authorized = await this.authorizePet(petId);
    const photo = await this.repository.updatePrimaryPhoto(photoId, authorized.petId, authorized.accountId);
    if (!photo) throw new PhotoNotFoundError("Photo not found.");

    return serializePhoto(photo, await this.storage.createSignedUrl(photo.storagePath));
  }

  async deletePhoto(petId: string, photoId: string): Promise<void> {
    const authorized = await this.authorizePet(petId);
    const photo = await this.repository.findPhoto(photoId, authorized.petId, authorized.accountId);
    if (!photo) throw new PhotoNotFoundError("Photo not found.");

    // Deleting the database record first avoids serving a record that points to
    // a removed object. Storage failures are surfaced as a safe retry message.
    const deleted = await this.repository.deletePhoto(photoId, authorized.petId, authorized.accountId);
    if (!deleted) throw new PhotoNotFoundError("Photo not found.");

    await this.storage.deletePhoto(photo.storagePath);
  }
}

export { InvalidPhotoError, PhotoStorageError };

async function authorizePhotoPet(petId: string) {
  try {
    const { accountId, pet } = await getAuthorizedPet(petId);
    return { accountId, petId: pet.id };
  } catch (error) {
    if (error instanceof PetAccessError) throw new PhotoNotFoundError("Pet not found.");
    throw error;
  }
}
