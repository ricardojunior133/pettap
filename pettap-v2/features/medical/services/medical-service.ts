import "server-only";

import { getAuthorizedPet, PetAccessError } from "@/features/pets/services/pet-access";

import { DrizzleMedicalRepository, type MedicalRepository } from "../repositories/medical-repository";
import type { MedicalInformation, MedicalInformationInput } from "../types/medical";
import { decryptMedicalPayload, encryptMedicalPayload, MedicalEncryptionError } from "./medical-crypto";

export class MedicalNotFoundError extends Error {}

type MedicalPetAuthorizer = (petId: string) => Promise<{ pet: { id: string } }>;

function serialize(record: { petId: string; encryptedPayload: unknown; createdAt: Date; updatedAt: Date }): MedicalInformation {
  return {
    petId: record.petId,
    ...decryptMedicalPayload(record.encryptedPayload),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export class MedicalService {
  constructor(
    private readonly repository: MedicalRepository = new DrizzleMedicalRepository(),
    private readonly resolveAuthorizedPet: MedicalPetAuthorizer = authorizeMedicalPet,
  ) {}

  private async authorize(petId: string) {
    return this.resolveAuthorizedPet(petId);
  }

  async getMedicalInformation(petId: string): Promise<MedicalInformation | null> {
    const authorized = await this.authorize(petId);
    const record = await this.repository.findMedicalInformation(authorized.pet.id);
    return record ? serialize(record) : null;
  }

  async saveMedicalInformation(petId: string, input: MedicalInformationInput): Promise<MedicalInformation> {
    const authorized = await this.authorize(petId);
    const encryptedPayload = encryptMedicalPayload(input);
    const existing = await this.repository.findMedicalInformation(authorized.pet.id);
    const record = existing
      ? await this.repository.updateMedicalInformation(authorized.pet.id, encryptedPayload)
      : await this.repository.createMedicalInformation(authorized.pet.id, encryptedPayload);

    if (!record) throw new MedicalNotFoundError("Medical information could not be saved.");
    return serialize(record);
  }
}

export { MedicalEncryptionError };

async function authorizeMedicalPet(petId: string) {
  try {
    return await getAuthorizedPet(petId);
  } catch (error) {
    if (error instanceof PetAccessError) throw new MedicalNotFoundError("Pet not found.");
    throw error;
  }
}
