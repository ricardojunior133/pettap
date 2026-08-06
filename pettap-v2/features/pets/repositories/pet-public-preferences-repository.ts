import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { auditLogs, petPublicPreferences, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import { privatePetPublicPreferences, type PetPublicPreferencesInput } from "../schemas/pet-public-preferences";

export type StoredPetPublicPreferences = { [Key in keyof typeof privatePetPublicPreferences]: boolean };

export type PetPrivacyAudit = {
  petId: string;
  changedFields: string[];
  publicProfileEnabledChanged: boolean;
};

const preferenceSelection = {
  showPhoto: petPublicPreferences.showPhoto,
  showName: petPublicPreferences.showName,
  showBreed: petPublicPreferences.showBreed,
  showAge: petPublicPreferences.showAge,
  showMedicalConditions: petPublicPreferences.showMedicalConditions,
  showMedications: petPublicPreferences.showMedications,
  showPrimaryContact: petPublicPreferences.showPrimaryContact,
  showEmergencyContacts: petPublicPreferences.showEmergencyContacts,
  showSpecialInstructions: petPublicPreferences.showSpecialInstructions,
};

export class PetPublicPreferencesUnavailableError extends Error {}

export class PetPublicPreferencesRepository {
  private async ownerPetExists(accountId: string, petId: string) {
    const database = createDatabaseClient();
    const [pet] = await database
      .select({ id: pets.id })
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
      .limit(1);
    return Boolean(pet);
  }

  async isAvailable(): Promise<boolean> {
    const database = createDatabaseClient();
    const [result] = await database
      .select({ available: sql<boolean>`to_regclass('public.pet_public_preferences') is not null` })
      .from(pets)
      .limit(1);
    return result?.available ?? false;
  }

  async getByPetForAccount(accountId: string, petId: string): Promise<StoredPetPublicPreferences | null> {
    if (!await this.ownerPetExists(accountId, petId)) return null;
    if (!await this.isAvailable()) return null;

    const database = createDatabaseClient();
    const [preferences] = await database
      .select(preferenceSelection)
      .from(petPublicPreferences)
      .innerJoin(pets, eq(petPublicPreferences.petId, pets.id))
      .where(and(eq(petPublicPreferences.petId, petId), eq(pets.accountId, accountId)))
      .limit(1);
    return preferences ?? null;
  }

  async getPublicProfileEnabledForPetAccount(accountId: string, petId: string): Promise<boolean | null> {
    const database = createDatabaseClient();
    const [pet] = await database
      .select({ publicProfileEnabled: pets.publicProfileEnabled })
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
      .limit(1);
    return pet?.publicProfileEnabled ?? null;
  }

  async getOrDefaultByPetForAccount(accountId: string, petId: string): Promise<StoredPetPublicPreferences | null> {
    const preferences = await this.getByPetForAccount(accountId, petId);
    if (preferences) return preferences;
    return (await this.ownerPetExists(accountId, petId)) ? privatePetPublicPreferences : null;
  }

  async upsertForPet(accountId: string, petId: string, input: PetPublicPreferencesInput, audit: PetPrivacyAudit): Promise<StoredPetPublicPreferences | null> {
    if (!await this.isAvailable()) throw new PetPublicPreferencesUnavailableError("Privacy controls require migration 0007.");
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [pet] = await transaction
        .select({ id: pets.id })
        .from(pets)
        .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
        .limit(1);
      if (!pet) return null;

      await transaction
        .update(pets)
        .set({ publicProfileEnabled: input.publicProfileEnabled, updatedAt: new Date() })
        .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)));

      const preferences = {
        showPhoto: input.showPhoto,
        showName: input.showName,
        showBreed: input.showBreed,
        showAge: input.showAge,
        showMedicalConditions: input.showMedicalConditions,
        showMedications: input.showMedications,
        showPrimaryContact: input.showPrimaryContact,
        showEmergencyContacts: input.showEmergencyContacts,
        showSpecialInstructions: input.showSpecialInstructions,
      };
      const [updated] = await transaction
        .insert(petPublicPreferences)
        .values({ petId, ...preferences, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: petPublicPreferences.petId,
          set: { ...preferences, updatedAt: new Date() },
        })
        .returning(preferenceSelection);

      if (audit.changedFields.length > 0) {
        await transaction.insert(auditLogs).values({
          accountId,
          action: "privacy.updated",
          targetType: "pet_public_preferences",
          targetId: petId,
          result: "success",
          metadata: audit,
        });
      }

      return updated;
    });
  }
}
