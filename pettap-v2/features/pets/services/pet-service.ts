import "server-only";

import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { ensureAccountProfile } from "@/features/owner/services/profile-service";

import { petIdSchema } from "../schemas/pet";
import { DrizzlePetRepository, type PetRepository } from "../repositories/pet-repository";
import type { Pet, PetInput } from "../types/pet";

export class PetAuthorizationError extends Error {}
export class PetDeletionConflictError extends Error {}

export type AccountResolver = () => Promise<string>;

export async function getAuthenticatedAccountId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new PetAuthorizationError("Authentication is required.");

  await ensureAccountProfile({
    authUserId: user.id,
    email: user.email,
    userMetadata: user.user_metadata,
  });

  return user.id;
}

function createPublicId() {
  return `PTP-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

function isForeignKeyConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23503";
}

export class PetService {
  constructor(
    private readonly repository: PetRepository = new DrizzlePetRepository(),
    private readonly resolveAccountId: AccountResolver = getAuthenticatedAccountId,
  ) {}

  async listPets(): Promise<Pet[]> {
    return this.repository.listPetsByAccount(await this.resolveAccountId());
  }

  async countPets(): Promise<number> {
    return this.repository.countPetsByAccount(await this.resolveAccountId());
  }

  async getPet(petId: string): Promise<Pet | null> {
    const parsedId = petIdSchema.safeParse(petId);
    if (!parsedId.success) return null;

    return this.repository.findPetByIdAndAccount(parsedId.data, await this.resolveAccountId());
  }

  async createPet(data: PetInput): Promise<Pet> {
    return this.repository.createPetForAccount(await this.resolveAccountId(), {
      ...data,
      publicId: createPublicId(),
    });
  }

  async updatePet(petId: string, data: PetInput): Promise<Pet | null> {
    const parsedId = petIdSchema.safeParse(petId);
    if (!parsedId.success) return null;

    return this.repository.updatePetForAccount(parsedId.data, await this.resolveAccountId(), data);
  }

  async deletePet(petId: string): Promise<boolean> {
    const parsedId = petIdSchema.safeParse(petId);
    if (!parsedId.success) return false;

    try {
      return await this.repository.deletePetForAccount(parsedId.data, await this.resolveAccountId());
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new PetDeletionConflictError("This pet still has connected records.");
      }

      throw error;
    }
  }
}

export function createPetService() {
  return new PetService();
}
