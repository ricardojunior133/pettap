import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { auditLogs, emergencyContacts, medicalInformation, nfcTags, petPhotos, petPublicPreferences, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type PublicPreferenceRecord = {
  showPhoto: boolean;
  showName: boolean;
  showBreed: boolean;
  showAge: boolean;
  showMedicalConditions: boolean;
  showMedications: boolean;
  showPrimaryContact: boolean;
  showEmergencyContacts: boolean;
  showSpecialInstructions: boolean;
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

export class PublicTagRepository {
  private async preferencesTableExists() {
    const database = createDatabaseClient();
    const [result] = await database.select({ available: sql<boolean>`to_regclass('public.pet_public_preferences') is not null` }).from(nfcTags).limit(1);
    return result?.available ?? false;
  }

  async find(tagId: string) {
    const database = createDatabaseClient();
    const [tag] = await database.select({ id: nfcTags.id, publicId: nfcTags.publicId, status: nfcTags.status, petId: nfcTags.petId }).from(nfcTags).where(eq(nfcTags.publicId, tagId)).limit(1);
    if (!tag || !tag.petId) return tag ? { tag, pet: null, preferences: null } : null;

    const [pet] = await database.select({ id: pets.id, name: pets.name, species: pets.species, publicProfileEnabled: pets.publicProfileEnabled }).from(pets).where(eq(pets.id, tag.petId)).limit(1);
    if (!pet) return { tag, pet: null, preferences: null };

    const preferences = await this.preferencesTableExists()
      ? (await database.select(preferenceSelection).from(petPublicPreferences).where(eq(petPublicPreferences.petId, pet.id)).limit(1))[0] ?? null
      : null;

    return { tag, pet, preferences };
  }

  async findPrimaryPhotoPath(petId: string) {
    const database = createDatabaseClient();
    const [photo] = await database.select({ storagePath: petPhotos.storagePath }).from(petPhotos).where(and(eq(petPhotos.petId, petId), eq(petPhotos.isPrimary, true))).limit(1);
    return photo?.storagePath ?? null;
  }

  async findMedicalPayload(petId: string) {
    const database = createDatabaseClient();
    const [medical] = await database.select({ encryptedPayload: medicalInformation.encryptedPayload }).from(medicalInformation).where(eq(medicalInformation.petId, petId)).limit(1);
    return medical?.encryptedPayload ?? null;
  }

  async findEmergencyContacts(petId: string) {
    const database = createDatabaseClient();
    return database.select({ name: emergencyContacts.name, phone: emergencyContacts.phone, isPrimary: emergencyContacts.isPrimary }).from(emergencyContacts).where(eq(emergencyContacts.petId, petId));
  }

  async recordView(tagId: string, country: string | null, userAgent: string | null) {
    const database = createDatabaseClient();
    await database.insert(auditLogs).values({ accountId: null, action: "public.tag.viewed", targetType: "nfc_tag", targetId: tagId, result: "success", metadata: { country: country ?? "unknown", userAgent: userAgent ? userAgent.slice(0, 120) : "unknown" } });
  }
}
