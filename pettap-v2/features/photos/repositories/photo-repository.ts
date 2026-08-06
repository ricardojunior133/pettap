import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { petPhotos, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { StoredPetPhoto } from "../types/photo";

const photoSelection = {
  id: petPhotos.id,
  petId: petPhotos.petId,
  storagePath: petPhotos.storagePath,
  isPrimary: petPhotos.isPrimary,
  createdAt: petPhotos.createdAt,
};

export interface PhotoRepository {
  listPetPhotos(petId: string, accountId: string): Promise<StoredPetPhoto[]>;
  findPhoto(photoId: string, petId: string, accountId: string): Promise<StoredPetPhoto | null>;
  insertPhoto(input: { id: string; petId: string; accountId: string; storagePath: string; isPrimary: boolean }): Promise<StoredPetPhoto>;
  deletePhoto(photoId: string, petId: string, accountId: string): Promise<StoredPetPhoto | null>;
  updatePrimaryPhoto(photoId: string, petId: string, accountId: string): Promise<StoredPetPhoto | null>;
  countPetPhotos(petId: string, accountId: string): Promise<number>;
}

function ownedPetCondition(petId: string, accountId: string) {
  return sql`exists (select 1 from ${pets} where ${pets.id} = ${petId} and ${pets.accountId} = ${accountId} and ${pets.id} = ${petPhotos.petId})`;
}

export class DrizzlePhotoRepository implements PhotoRepository {
  async listPetPhotos(petId: string, accountId: string): Promise<StoredPetPhoto[]> {
    const database = createDatabaseClient();
    return database.select(photoSelection).from(petPhotos).where(and(eq(petPhotos.petId, petId), ownedPetCondition(petId, accountId))).orderBy(desc(petPhotos.isPrimary), desc(petPhotos.createdAt));
  }

  async findPhoto(photoId: string, petId: string, accountId: string): Promise<StoredPetPhoto | null> {
    const database = createDatabaseClient();
    const [photo] = await database.select(photoSelection).from(petPhotos).where(and(eq(petPhotos.id, photoId), eq(petPhotos.petId, petId), ownedPetCondition(petId, accountId))).limit(1);
    return photo ?? null;
  }

  async insertPhoto(input: { id: string; petId: string; accountId: string; storagePath: string; isPrimary: boolean }): Promise<StoredPetPhoto> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [ownedPet] = await transaction.select({ id: pets.id }).from(pets).where(and(eq(pets.id, input.petId), eq(pets.accountId, input.accountId))).limit(1);
      if (!ownedPet) throw new Error("PET_PHOTO_ACCESS_DENIED");

      if (input.isPrimary) {
        await transaction.update(petPhotos).set({ isPrimary: false, updatedAt: new Date() }).where(eq(petPhotos.petId, input.petId));
      }

      const [photo] = await transaction.insert(petPhotos).values({ id: input.id, petId: input.petId, storagePath: input.storagePath, isPrimary: input.isPrimary }).returning(photoSelection);
      return photo;
    });
  }

  async deletePhoto(photoId: string, petId: string, accountId: string): Promise<StoredPetPhoto | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [photo] = await transaction.delete(petPhotos).where(and(eq(petPhotos.id, photoId), eq(petPhotos.petId, petId), ownedPetCondition(petId, accountId))).returning(photoSelection);
      if (!photo) return null;

      if (photo.isPrimary) {
        const [nextPhoto] = await transaction.select(photoSelection).from(petPhotos).where(eq(petPhotos.petId, petId)).orderBy(desc(petPhotos.createdAt)).limit(1);
        if (nextPhoto) {
          await transaction.update(petPhotos).set({ isPrimary: true, updatedAt: new Date() }).where(eq(petPhotos.id, nextPhoto.id));
        }
      }

      return photo;
    });
  }

  async updatePrimaryPhoto(photoId: string, petId: string, accountId: string): Promise<StoredPetPhoto | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [photo] = await transaction.select(photoSelection).from(petPhotos).where(and(eq(petPhotos.id, photoId), eq(petPhotos.petId, petId), ownedPetCondition(petId, accountId))).limit(1);
      if (!photo) return null;

      await transaction.update(petPhotos).set({ isPrimary: false, updatedAt: new Date() }).where(eq(petPhotos.petId, petId));
      const [updatedPhoto] = await transaction.update(petPhotos).set({ isPrimary: true, updatedAt: new Date() }).where(and(eq(petPhotos.id, photoId), eq(petPhotos.petId, petId), ownedPetCondition(petId, accountId))).returning(photoSelection);
      return updatedPhoto ?? null;
    });
  }

  async countPetPhotos(petId: string, accountId: string): Promise<number> {
    const database = createDatabaseClient();
    const photos = await database.select({ id: petPhotos.id }).from(petPhotos).where(and(eq(petPhotos.petId, petId), ownedPetCondition(petId, accountId)));
    return photos.length;
  }
}
