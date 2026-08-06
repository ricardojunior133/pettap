import "server-only";

import {
  getAuthorizedPet,
  PetAccessError,
} from "@/features/pets/services/pet-access";
import { getAuthenticatedAccountId } from "@/features/pets/services/pet-service";

import {
  DrizzleLostReportRepository,
  type LostReportRepository,
  type LostReportResolution,
} from "../repositories/lost-report-repository";
import type { LostReportDetails } from "../types/lost-report";

export class LostReportNotFoundError extends Error {}

type AuthorizedPetLoader = typeof getAuthorizedPet;
type AccountIdLoader = typeof getAuthenticatedAccountId;

export class LostReportService {
  constructor(
    private readonly repository: LostReportRepository =
      new DrizzleLostReportRepository(),
    private readonly authorizedPetLoader: AuthorizedPetLoader = getAuthorizedPet,
    private readonly accountIdLoader: AccountIdLoader = getAuthenticatedAccountId,
  ) {}

  async active(petId: string) {
    try {
      const { accountId, pet } = await this.authorizedPetLoader(petId);
      return this.repository.findActive(pet.id, accountId);
    } catch (error) {
      if (error instanceof PetAccessError) throw new LostReportNotFoundError();
      throw error;
    }
  }

  async create(petId: string, details: LostReportDetails) {
    try {
      const { accountId, pet } = await this.authorizedPetLoader(petId);
      return this.repository.create(pet.id, accountId, details);
    } catch (error) {
      if (error instanceof PetAccessError) throw new LostReportNotFoundError();
      throw error;
    }
  }

  async resolve(
    petId: string,
    lostReportId: string,
  ): Promise<Exclude<LostReportResolution, "not-found">> {
    try {
      const { accountId, pet } = await this.authorizedPetLoader(petId);
      const resolution = await this.repository.resolve(
        lostReportId,
        pet.id,
        accountId,
      );

      if (resolution === "not-found") throw new LostReportNotFoundError();
      return resolution;
    } catch (error) {
      if (error instanceof PetAccessError) throw new LostReportNotFoundError();
      throw error;
    }
  }

  async listActive() {
    return this.repository.listActive(await this.accountIdLoader());
  }
}
