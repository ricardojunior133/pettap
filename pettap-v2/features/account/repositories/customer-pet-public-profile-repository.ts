import "server-only";

import { and, eq } from "drizzle-orm";

import { auditLogs, petPublicPreferences, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { CustomerPetPublicProfileInput } from "../schemas/customer-pet-public-profile";

export type CustomerPetPublicProfileRecord = {
  publicId: string;
  enabled: boolean;
  showPhoto: boolean;
  showName: boolean;
  showBreed: boolean;
  showAge: boolean;
  publicMessage: string | null;
  updatedAt: Date | null;
};

export interface CustomerPetPublicProfileRepository {
  find(accountId: string, petPublicIdentifier: string): Promise<CustomerPetPublicProfileRecord | null>;
  save(accountId: string, petPublicIdentifier: string, input: CustomerPetPublicProfileInput): Promise<CustomerPetPublicProfileRecord | null>;
}

/** Owner-scoped profile preferences. The audit metadata contains consent flags only, never public copy. */
export class DrizzleCustomerPetPublicProfileRepository implements CustomerPetPublicProfileRepository {
  async find(accountId: string, petPublicIdentifier: string): Promise<CustomerPetPublicProfileRecord | null> {
    const database = createDatabaseClient();
    const [row] = await database.select({
      id: pets.id,
      publicId: pets.publicId,
      enabled: pets.publicProfileEnabled,
      showPhoto: petPublicPreferences.showPhoto,
      showName: petPublicPreferences.showName,
      showBreed: petPublicPreferences.showBreed,
      showAge: petPublicPreferences.showAge,
      publicMessage: petPublicPreferences.publicMessage,
      updatedAt: petPublicPreferences.updatedAt,
    }).from(pets).leftJoin(petPublicPreferences, eq(petPublicPreferences.petId, pets.id))
      .where(and(eq(pets.accountId, accountId), eq(pets.publicId, petPublicIdentifier))).limit(1);
    return row ? this.toRecord(row) : null;
  }

  async save(accountId: string, petPublicIdentifier: string, input: CustomerPetPublicProfileInput): Promise<CustomerPetPublicProfileRecord | null> {
    const database = createDatabaseClient();
    return database.transaction(async (transaction) => {
      const [pet] = await transaction.select({ id: pets.id, publicId: pets.publicId }).from(pets)
        .where(and(eq(pets.accountId, accountId), eq(pets.publicId, petPublicIdentifier))).for("update").limit(1);
      if (!pet) return null;
      const now = new Date();
      await transaction.update(pets).set({ publicProfileEnabled: input.enabled, updatedAt: now })
        .where(and(eq(pets.id, pet.id), eq(pets.accountId, accountId)));
      const values = {
        petId: pet.id,
        showPhoto: input.showPhoto,
        showName: input.showName,
        showBreed: input.showBreed,
        showAge: input.showAge,
        publicMessage: input.publicMessage,
        updatedAt: now,
      };
      await transaction.insert(petPublicPreferences).values(values).onConflictDoUpdate({
        target: petPublicPreferences.petId,
        set: values,
      });
      await transaction.insert(auditLogs).values({
        accountId,
        action: "pet.public_profile_updated",
        targetType: "pet",
        targetId: pet.id,
        result: "success",
        metadata: { enabled: input.enabled, showPhoto: input.showPhoto, showName: input.showName, showBreed: input.showBreed, showAge: input.showAge },
      });
      return { publicId: pet.publicId, enabled: input.enabled, showPhoto: input.showPhoto, showName: input.showName, showBreed: input.showBreed, showAge: input.showAge, publicMessage: input.publicMessage, updatedAt: now };
    });
  }

  private toRecord(row: { publicId: string; enabled: boolean; showPhoto: boolean | null; showName: boolean | null; showBreed: boolean | null; showAge: boolean | null; publicMessage: string | null; updatedAt: Date | null }): CustomerPetPublicProfileRecord {
    return { publicId: row.publicId, enabled: row.enabled, showPhoto: row.showPhoto ?? false, showName: row.showName ?? false, showBreed: row.showBreed ?? false, showAge: row.showAge ?? false, publicMessage: row.publicMessage, updatedAt: row.updatedAt };
  }
}
