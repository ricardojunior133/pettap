import "server-only";

import { getAuthenticatedAccountId, type AccountResolver } from "@/features/commerce/services/commerce-account-service";

import type { CustomerPetPublicProfileInput } from "../schemas/customer-pet-public-profile";
import { DrizzleCustomerPetPublicProfileRepository, type CustomerPetPublicProfileRecord, type CustomerPetPublicProfileRepository } from "../repositories/customer-pet-public-profile-repository";

export type CustomerPetPublicProfileView = {
  enabled: boolean;
  showPhoto: boolean;
  showName: boolean;
  showBreed: boolean;
  showAge: boolean;
  publicMessage: string | null;
  updatedAt: string | null;
};

function toView(record: CustomerPetPublicProfileRecord): CustomerPetPublicProfileView {
  return { ...record, updatedAt: record.updatedAt?.toISOString() ?? null };
}

export class CustomerPetPublicProfileService {
  constructor(
    private readonly repository: CustomerPetPublicProfileRepository = new DrizzleCustomerPetPublicProfileRepository(),
    private readonly resolveAccountId: AccountResolver = getAuthenticatedAccountId,
  ) {}

  async get(petPublicIdentifier: string): Promise<CustomerPetPublicProfileView | null> {
    const record = await this.repository.find(await this.resolveAccountId(), petPublicIdentifier.trim());
    return record ? toView(record) : null;
  }

  async save(petPublicIdentifier: string, input: CustomerPetPublicProfileInput): Promise<CustomerPetPublicProfileView | null> {
    const record = await this.repository.save(await this.resolveAccountId(), petPublicIdentifier.trim(), input);
    return record ? toView(record) : null;
  }
}
