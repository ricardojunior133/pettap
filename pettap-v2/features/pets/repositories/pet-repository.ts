import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { Pet, PetInput } from "../types/pet";

type PetRow = typeof pets.$inferSelect;

const petSelection = {
  id: pets.id,
  name: pets.name,
  species: pets.species,
  publicId: pets.publicId,
  publicProfileEnabled: pets.publicProfileEnabled,
  createdAt: pets.createdAt,
  updatedAt: pets.updatedAt,
};

function serializePet(row: Pick<PetRow, "id" | "name" | "species" | "publicId" | "publicProfileEnabled" | "createdAt" | "updatedAt">): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species as Pet["species"],
    publicId: row.publicId,
    publicProfileEnabled: row.publicProfileEnabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface PetRepository {
  listPetsByAccount(accountId: string): Promise<Pet[]>;
  countPetsByAccount(accountId: string): Promise<number>;
  findPetByIdAndAccount(petId: string, accountId: string): Promise<Pet | null>;
  createPetForAccount(accountId: string, data: PetInput & { publicId: string }): Promise<Pet>;
  updatePetForAccount(petId: string, accountId: string, data: PetInput): Promise<Pet | null>;
  deletePetForAccount(petId: string, accountId: string): Promise<boolean>;
}

export class DrizzlePetRepository implements PetRepository {
  async listPetsByAccount(accountId: string): Promise<Pet[]> {
    const database = createDatabaseClient();
    const records = await database
      .select(petSelection)
      .from(pets)
      .where(eq(pets.accountId, accountId))
      .orderBy(desc(pets.createdAt));

    return records.map(serializePet);
  }

  async countPetsByAccount(accountId: string): Promise<number> {
    const database = createDatabaseClient();
    const [result] = await database
      .select({ value: count() })
      .from(pets)
      .where(eq(pets.accountId, accountId));

    return result?.value ?? 0;
  }

  async findPetByIdAndAccount(petId: string, accountId: string): Promise<Pet | null> {
    const database = createDatabaseClient();
    const [record] = await database
      .select(petSelection)
      .from(pets)
      .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
      .limit(1);

    return record ? serializePet(record) : null;
  }

  async createPetForAccount(accountId: string, data: PetInput & { publicId: string }): Promise<Pet> {
    const database = createDatabaseClient();
    const [record] = await database
      .insert(pets)
      .values({
        accountId,
        name: data.name,
        species: data.species,
        publicId: data.publicId,
      })
      .returning(petSelection);

    return serializePet(record);
  }

  async updatePetForAccount(petId: string, accountId: string, data: PetInput): Promise<Pet | null> {
    const database = createDatabaseClient();
    const [record] = await database
      .update(pets)
      .set({ name: data.name, species: data.species, updatedAt: new Date() })
      .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
      .returning(petSelection);

    return record ? serializePet(record) : null;
  }

  async deletePetForAccount(petId: string, accountId: string): Promise<boolean> {
    const database = createDatabaseClient();
    const [deleted] = await database
      .delete(pets)
      .where(and(eq(pets.id, petId), eq(pets.accountId, accountId)))
      .returning({ id: pets.id });

    return Boolean(deleted);
  }
}
