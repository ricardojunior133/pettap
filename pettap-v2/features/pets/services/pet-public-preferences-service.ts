import "server-only";

import { getAuthenticatedAccountId } from "./pet-service";
import {
  PetPublicPreferencesRepository,
  PetPublicPreferencesUnavailableError,
  type StoredPetPublicPreferences,
} from "../repositories/pet-public-preferences-repository";
import { privatePetPublicPreferences, type PetPublicPreferencesInput, type PetPublicPreferencesViewModel } from "../schemas/pet-public-preferences";

type AccountResolver = () => Promise<string>;

function viewModel(petId: string, publicProfileEnabled: boolean, preferences: StoredPetPublicPreferences, available: boolean): PetPublicPreferencesViewModel {
  return { petId, publicProfileEnabled, ...preferences, available };
}

export class PetPublicPreferencesService {
  constructor(
    private readonly repository = new PetPublicPreferencesRepository(),
    private readonly resolveAccountId: AccountResolver = getAuthenticatedAccountId,
  ) {}

  async get(petId: string): Promise<PetPublicPreferencesViewModel | null> {
    const accountId = await this.resolveAccountId();
    const preferences = await this.repository.getOrDefaultByPetForAccount(accountId, petId);
    if (!preferences) return null;
    const publicProfileEnabled = await this.repository.getPublicProfileEnabledForPetAccount(accountId, petId);
    if (publicProfileEnabled === null) return null;
    const available = await this.repository.isAvailable();
    return viewModel(petId, publicProfileEnabled, preferences, available);
  }

  async update(petId: string, input: PetPublicPreferencesInput): Promise<PetPublicPreferencesViewModel | null> {
    const accountId = await this.resolveAccountId();
    const current = await this.repository.getOrDefaultByPetForAccount(accountId, petId);
    if (!current) return null;
    const currentPublicProfileEnabled = await this.repository.getPublicProfileEnabledForPetAccount(accountId, petId);
    if (currentPublicProfileEnabled === null) return null;

    const changedFields = Object.entries(input)
      .filter(([field, value]) => field === "publicProfileEnabled" ? value !== currentPublicProfileEnabled : value !== current[field as keyof StoredPetPublicPreferences])
      .map(([field]) => field);
    const updated = await this.repository.upsertForPet(accountId, petId, input, {
      petId,
      changedFields,
      publicProfileEnabledChanged: input.publicProfileEnabled !== currentPublicProfileEnabled,
    });
    return updated ? viewModel(petId, input.publicProfileEnabled, updated, true) : null;
  }
}

export { PetPublicPreferencesUnavailableError, privatePetPublicPreferences };
