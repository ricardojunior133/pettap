import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type OwnedPetFoundationRecord = {
  id: string;
  publicId: string;
  name: string;
  archivedAt: Date | null;
};

export interface CustomerPetFoundationRepository {
  listOwnedPets(accountId: string): Promise<OwnedPetFoundationRecord[]>;
  findOwnedPetByPublicIdentifier(accountId: string, publicIdentifier: string): Promise<OwnedPetFoundationRecord | null>;
  findOwnedPetByInternalId(accountId: string, internalId: string): Promise<OwnedPetFoundationRecord | null>;
}

export class DrizzleCustomerPetFoundationRepository implements CustomerPetFoundationRepository {
  async listOwnedPets(accountId: string) {
    const database = createDatabaseClient();
    return database.select({ id: pets.id, publicId: pets.publicId, name: pets.name, archivedAt: pets.archivedAt })
      .from(pets).where(eq(pets.accountId, accountId)).orderBy(desc(pets.createdAt), desc(pets.publicId));
  }

  async findOwnedPetByPublicIdentifier(accountId: string, publicIdentifier: string) {
    const database = createDatabaseClient();
    const [pet] = await database.select({ id: pets.id, publicId: pets.publicId, name: pets.name, archivedAt: pets.archivedAt })
      .from(pets).where(and(eq(pets.accountId, accountId), eq(pets.publicId, publicIdentifier))).limit(1);
    return pet ?? null;
  }

  async findOwnedPetByInternalId(accountId: string, internalId: string) {
    const database = createDatabaseClient();
    const [pet] = await database.select({ id: pets.id, publicId: pets.publicId, name: pets.name, archivedAt: pets.archivedAt })
      .from(pets).where(and(eq(pets.accountId, accountId), eq(pets.id, internalId))).limit(1);
    return pet ?? null;
  }
}
