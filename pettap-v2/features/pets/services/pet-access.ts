import "server-only";

import { petIdSchema } from "../schemas/pet";
import { DrizzlePetRepository, type PetRepository } from "../repositories/pet-repository";
import { getAuthenticatedAccountId } from "./pet-service";

export class PetAccessError extends Error {}

export async function getAuthorizedPet(
  petId: string,
  repository: PetRepository = new DrizzlePetRepository(),
  resolveAccountId: () => Promise<string> = getAuthenticatedAccountId,
) {
  const parsedPetId = petIdSchema.safeParse(petId);
  if (!parsedPetId.success) throw new PetAccessError("Pet not found.");

  const accountId = await resolveAccountId();
  const pet = await repository.findPetByIdAndAccount(parsedPetId.data, accountId);
  if (!pet) throw new PetAccessError("Pet not found.");

  return { accountId, pet };
}
