import "server-only";

import { getAuthenticatedAccountId } from "@/features/commerce/services/commerce-account-service";

import { DrizzleCustomerPetFoundationRepository, type CustomerPetFoundationRepository, type OwnedPetFoundationRecord } from "../repositories/customer-pet-foundation-repository";

export type CustomerPetFoundationDto = { publicIdentifier: string; name: string; archived: boolean; primaryPhotoUrl: null };

function toDto(record: OwnedPetFoundationRecord): CustomerPetFoundationDto {
  return { publicIdentifier: record.publicId, name: record.name, archived: record.archivedAt !== null, primaryPhotoUrl: null };
}

export class CustomerPetFoundationService {
  constructor(private readonly repository: CustomerPetFoundationRepository = new DrizzleCustomerPetFoundationRepository(), private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId) {}
  async listOwnedPets() { return (await this.repository.listOwnedPets(await this.resolveAccountId())).map(toDto); }
  async getOwnedPet(publicIdentifier: string) { const record = await this.repository.findOwnedPetByPublicIdentifier(await this.resolveAccountId(), publicIdentifier.trim()); return record ? toDto(record) : null; }
}
