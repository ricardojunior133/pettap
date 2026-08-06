import "server-only";

import { getAuthorizedPet, PetAccessError } from "@/features/pets/services/pet-access";
import { MAX_EMERGENCY_CONTACTS_PER_PET } from "../constants";
import { emergencyContactIdSchema } from "../schemas/emergency-contact";
import { DrizzleEmergencyContactRepository, type EmergencyContactRepository } from "../repositories/emergency-contact-repository";
import type { EmergencyContact, EmergencyContactInput } from "../types/emergency-contact";

export class EmergencyContactNotFoundError extends Error {}
export class EmergencyContactLimitError extends Error {}
type Authorizer = (petId: string) => Promise<{ accountId: string; pet: { id: string } }>;

export class EmergencyContactService {
  constructor(private readonly repository: EmergencyContactRepository = new DrizzleEmergencyContactRepository(), private readonly authorizePet: Authorizer = authorize) {}
  async list(petId: string): Promise<EmergencyContact[]> { const { accountId, pet } = await this.authorizePet(petId); return this.repository.list(pet.id, accountId); }
  async get(petId: string, contactId: string) { if (!emergencyContactIdSchema.safeParse(contactId).success) return null; const { accountId, pet } = await this.authorizePet(petId); return this.repository.find(contactId, pet.id, accountId); }
  async create(petId: string, input: EmergencyContactInput) { const { accountId, pet } = await this.authorizePet(petId); if (await this.repository.count(pet.id, accountId) >= MAX_EMERGENCY_CONTACTS_PER_PET) throw new EmergencyContactLimitError(); return this.repository.create(pet.id, accountId, input); }
  async update(petId: string, contactId: string, input: EmergencyContactInput) { if (!emergencyContactIdSchema.safeParse(contactId).success) return null; const { accountId, pet } = await this.authorizePet(petId); return this.repository.update(contactId, pet.id, accountId, input); }
  async delete(petId: string, contactId: string) { if (!emergencyContactIdSchema.safeParse(contactId).success) return false; const { accountId, pet } = await this.authorizePet(petId); return this.repository.delete(contactId, pet.id, accountId); }
}
async function authorize(petId: string) { try { return await getAuthorizedPet(petId); } catch (error) { if (error instanceof PetAccessError) throw new EmergencyContactNotFoundError(); throw error; } }
