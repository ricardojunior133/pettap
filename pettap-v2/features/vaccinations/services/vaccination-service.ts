import "server-only";

import { getAuthorizedPet, PetAccessError } from "@/features/pets/services/pet-access";

import { vaccinationIdSchema } from "../schemas/vaccination";
import { DrizzleVaccinationRepository, type VaccinationRepository } from "../repositories/vaccination-repository";
import type { Vaccination, VaccinationInput } from "../types/vaccination";

export class VaccinationNotFoundError extends Error {}

type VaccinationPetAuthorizer = (petId: string) => Promise<{ pet: { id: string } }>;

export class VaccinationService {
  constructor(
    private readonly repository: VaccinationRepository = new DrizzleVaccinationRepository(),
    private readonly resolveAuthorizedPet: VaccinationPetAuthorizer = authorizeVaccinationPet,
  ) {}

  private async authorize(petId: string) {
    return this.resolveAuthorizedPet(petId);
  }

  async listVaccinations(petId: string): Promise<Vaccination[]> {
    const authorized = await this.authorize(petId);
    return this.repository.listVaccinations(authorized.pet.id);
  }

  async getVaccination(petId: string, vaccinationId: string): Promise<Vaccination | null> {
    if (!vaccinationIdSchema.safeParse(vaccinationId).success) return null;
    const authorized = await this.authorize(petId);
    return this.repository.findVaccination(vaccinationId, authorized.pet.id);
  }

  async createVaccination(petId: string, input: VaccinationInput): Promise<Vaccination> {
    const authorized = await this.authorize(petId);
    return this.repository.createVaccination(authorized.pet.id, input);
  }

  async updateVaccination(petId: string, vaccinationId: string, input: VaccinationInput): Promise<Vaccination | null> {
    if (!vaccinationIdSchema.safeParse(vaccinationId).success) return null;
    const authorized = await this.authorize(petId);
    return this.repository.updateVaccination(vaccinationId, authorized.pet.id, input);
  }

  async deleteVaccination(petId: string, vaccinationId: string): Promise<boolean> {
    if (!vaccinationIdSchema.safeParse(vaccinationId).success) return false;
    const authorized = await this.authorize(petId);
    return this.repository.deleteVaccination(vaccinationId, authorized.pet.id);
  }
}

async function authorizeVaccinationPet(petId: string) {
  try {
    return await getAuthorizedPet(petId);
  } catch (error) {
    if (error instanceof PetAccessError) throw new VaccinationNotFoundError("Pet not found.");
    throw error;
  }
}
