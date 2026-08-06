import "server-only";

import { decryptMedicalPayload, MedicalEncryptionError } from "@/features/medical/services/medical-crypto";
import { PhotoStorageError, SupabaseStorageService, type StorageService } from "@/features/photos/services/storage-service";
import type { PublicMedicalViewModel, PublicPetViewModel, PublicTagResolution } from "../types";
import { PublicTagRepository, type PublicPreferenceRecord } from "../repositories/public-tag-repository";

const privatePreferences: PublicPreferenceRecord = {
  showPhoto: false, showName: false, showBreed: false, showAge: false, showMedicalConditions: false,
  showMedications: false, showPrimaryContact: false, showEmergencyContacts: false, showSpecialInstructions: false,
};

function nonEmpty(value: string | null) {
  return value?.trim() || undefined;
}

export class PublicTagService {
  constructor(private readonly repository = new PublicTagRepository(), private readonly storage: StorageService = new SupabaseStorageService()) {}

  async resolve(tagId: string, audit: { country: string | null; userAgent: string | null }): Promise<PublicTagResolution> {
    const result = await this.repository.find(tagId);
    if (!result) return { kind: "unknown" };
    if (result.tag.status === "suspended") return { kind: "suspended", reference: result.tag.publicId };
    if (result.tag.status === "retired" || result.tag.status === "unassigned") return { kind: "unknown" };
    if (!result.pet) return { kind: "orphan", reference: result.tag.publicId };
    if (!result.pet.publicProfileEnabled || (result.tag.status !== "active" && result.tag.status !== "lost")) return { kind: "unknown" };

    const preferences = result.preferences ?? privatePreferences;
    const pet: PublicPetViewModel = {};
    if (preferences.showName) pet.name = result.pet.name;
    if (preferences.showPhoto) {
      const storagePath = await this.repository.findPrimaryPhotoPath(result.pet.id);
      if (storagePath) {
        try { pet.photoUrl = await this.storage.createSignedUrl(storagePath); } catch (error) { if (!(error instanceof PhotoStorageError)) throw error; }
      }
    }

    const resolution: Extract<PublicTagResolution, { kind: "profile" }> = { kind: "profile", tagId: result.tag.publicId, status: result.tag.status, pet };
    if (preferences.showMedicalConditions || preferences.showMedications || preferences.showSpecialInstructions) {
      const encryptedPayload = await this.repository.findMedicalPayload(result.pet.id);
      if (encryptedPayload) {
        try {
          const medical = decryptMedicalPayload(encryptedPayload);
          const publicMedical: PublicMedicalViewModel = {};
          if (preferences.showMedicalConditions && nonEmpty(medical.conditions)) publicMedical.conditions = nonEmpty(medical.conditions);
          if (preferences.showMedications && nonEmpty(medical.medications)) publicMedical.medications = nonEmpty(medical.medications);
          if (preferences.showSpecialInstructions && nonEmpty(medical.careInstructions)) publicMedical.specialInstructions = nonEmpty(medical.careInstructions);
          if (Object.keys(publicMedical).length) resolution.medical = publicMedical;
        } catch (error) { if (!(error instanceof MedicalEncryptionError)) throw error; }
      }
    }
    if (preferences.showPrimaryContact || preferences.showEmergencyContacts) {
      const contacts = await this.repository.findEmergencyContacts(result.pet.id);
      const primary = contacts.find((contact) => contact.isPrimary);
      if (preferences.showPrimaryContact && primary) resolution.primaryContact = { name: primary.name, phone: primary.phone };
      if (preferences.showEmergencyContacts) resolution.emergencyContacts = contacts.filter((contact) => !contact.isPrimary).map(({ name, phone }) => ({ name, phone }));
    }

    await this.repository.recordView(result.tag.id, audit.country, audit.userAgent);
    return resolution;
  }
}
