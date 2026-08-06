import "server-only";

import { eq } from "drizzle-orm";

import { medicalInformation } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type StoredMedicalInformation = {
  petId: string;
  encryptedPayload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

const selection = {
  petId: medicalInformation.petId,
  encryptedPayload: medicalInformation.encryptedPayload,
  createdAt: medicalInformation.createdAt,
  updatedAt: medicalInformation.updatedAt,
};

export interface MedicalRepository {
  findMedicalInformation(petId: string): Promise<StoredMedicalInformation | null>;
  createMedicalInformation(petId: string, encryptedPayload: unknown): Promise<StoredMedicalInformation>;
  updateMedicalInformation(petId: string, encryptedPayload: unknown): Promise<StoredMedicalInformation | null>;
  deleteMedicalInformation(petId: string): Promise<boolean>;
}

export class DrizzleMedicalRepository implements MedicalRepository {
  async findMedicalInformation(petId: string) {
    const database = createDatabaseClient();
    const [record] = await database.select(selection).from(medicalInformation).where(eq(medicalInformation.petId, petId)).limit(1);
    return record ?? null;
  }

  async createMedicalInformation(petId: string, encryptedPayload: unknown) {
    const database = createDatabaseClient();
    const [record] = await database.insert(medicalInformation).values({ petId, encryptedPayload }).returning(selection);
    return record;
  }

  async updateMedicalInformation(petId: string, encryptedPayload: unknown) {
    const database = createDatabaseClient();
    const [record] = await database.update(medicalInformation).set({ encryptedPayload, updatedAt: new Date() }).where(eq(medicalInformation.petId, petId)).returning(selection);
    return record ?? null;
  }

  async deleteMedicalInformation(petId: string) {
    const database = createDatabaseClient();
    const [record] = await database.delete(medicalInformation).where(eq(medicalInformation.petId, petId)).returning({ petId: medicalInformation.petId });
    return Boolean(record);
  }
}
