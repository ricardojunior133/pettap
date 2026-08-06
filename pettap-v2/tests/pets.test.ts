import { describe, expect, it } from "vitest";

import { createPetSchema, petIdSchema, updatePetSchema } from "@/features/pets/schemas/pet";
import type { PetRepository } from "@/features/pets/repositories/pet-repository";
import { PetService } from "@/features/pets/services/pet-service";
import type { Pet, PetInput } from "@/features/pets/types/pet";

const accountA = "1c22c471-918d-4abf-9f77-e37f8db8bdb6";
const accountB = "e129a6e8-2b96-48af-a2a2-2e7cd0e18ca5";
const petId = "49af404d-95b7-4f95-a3c0-e4c4c86ac5c7";

function examplePet(ownerId = accountA): Pet & { ownerId: string } {
  return {
    id: petId,
    ownerId,
    name: "Milo",
    species: "dog",
    publicId: "PTP-ABC123DEF456",
    publicProfileEnabled: false,
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
  };
}

function repositoryWithPet(ownerId = accountA): PetRepository {
  const pet = examplePet(ownerId);

  return {
    async listPetsByAccount(accountId) {
      return accountId === ownerId ? [pet] : [];
    },
    async countPetsByAccount(accountId) {
      return accountId === ownerId ? 1 : 0;
    },
    async findPetByIdAndAccount(id, accountId) {
      return id === pet.id && accountId === ownerId ? pet : null;
    },
    async createPetForAccount(accountId, input) {
      return { ...pet, ...input, id: petId, createdAt: pet.createdAt, updatedAt: pet.updatedAt, publicProfileEnabled: false, publicId: input.publicId, name: input.name, species: input.species };
    },
    async updatePetForAccount(id, accountId, input) {
      return id === pet.id && accountId === ownerId ? { ...pet, ...input } : null;
    },
    async deletePetForAccount(id, accountId) {
      return id === pet.id && accountId === ownerId;
    },
  };
}

describe("pet schemas", () => {
  it("validates creation and editing from the real pets table fields", () => {
    expect(createPetSchema.parse({ name: "Milo", species: "dog" })).toEqual({ name: "Milo", species: "dog" });
    expect(updatePetSchema.parse({ name: "Milo", species: "cat" })).toEqual({ name: "Milo", species: "cat" });
  });

  it("rejects blank or invalid fields", () => {
    expect(() => createPetSchema.parse({ name: " ", species: "lizard" })).toThrow();
  });

  it("rejects invalid route identifiers", () => {
    expect(() => petIdSchema.parse("not-a-uuid")).toThrow();
  });
});

describe("pet ownership", () => {
  it("never returns another account's pet", async () => {
    const service = new PetService(repositoryWithPet(accountB), async () => accountA);
    expect(await service.getPet(petId)).toBeNull();
  });

  it("does not update or delete a pet across accounts", async () => {
    const service = new PetService(repositoryWithPet(accountB), async () => accountA);
    const input: PetInput = { name: "Milo", species: "dog" };

    expect(await service.updatePet(petId, input)).toBeNull();
    expect(await service.deletePet(petId)).toBe(false);
  });

  it("creates using the authenticated account only", async () => {
    let usedAccountId: string | undefined;
    const repository = repositoryWithPet();
    const originalCreate = repository.createPetForAccount;
    repository.createPetForAccount = async (accountId, input) => {
      usedAccountId = accountId;
      return originalCreate(accountId, input);
    };
    const service = new PetService(repository, async () => accountA);

    await service.createPet({ name: "Milo", species: "dog" });

    expect(usedAccountId).toBe(accountA);
  });
});
