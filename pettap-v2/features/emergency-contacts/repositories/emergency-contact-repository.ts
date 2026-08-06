import "server-only";

import { and, asc, count, eq } from "drizzle-orm";

import { emergencyContacts, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { EmergencyContact, EmergencyContactInput } from "../types/emergency-contact";

const selection = { id: emergencyContacts.id, petId: emergencyContacts.petId, name: emergencyContacts.name, relationship: emergencyContacts.relationship, phone: emergencyContacts.phone, isPrimary: emergencyContacts.isPrimary, createdAt: emergencyContacts.createdAt, updatedAt: emergencyContacts.updatedAt };

function serialize(row: typeof emergencyContacts.$inferSelect): EmergencyContact {
  return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}

export interface EmergencyContactRepository {
  list(petId: string, accountId: string): Promise<EmergencyContact[]>;
  find(contactId: string, petId: string, accountId: string): Promise<EmergencyContact | null>;
  count(petId: string, accountId: string): Promise<number>;
  create(petId: string, accountId: string, input: EmergencyContactInput): Promise<EmergencyContact>;
  update(contactId: string, petId: string, accountId: string, input: EmergencyContactInput): Promise<EmergencyContact | null>;
  delete(contactId: string, petId: string, accountId: string): Promise<boolean>;
}

export class DrizzleEmergencyContactRepository implements EmergencyContactRepository {
  private ownership(petId: string, accountId: string) { return and(eq(emergencyContacts.petId, petId), eq(pets.accountId, accountId)); }

  async list(petId: string, accountId: string) {
    const database = createDatabaseClient();
    const rows = await database.select(selection).from(emergencyContacts).innerJoin(pets, eq(emergencyContacts.petId, pets.id)).where(this.ownership(petId, accountId)).orderBy(asc(emergencyContacts.isPrimary), asc(emergencyContacts.createdAt));
    return rows.map(serialize).sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }

  async find(contactId: string, petId: string, accountId: string) {
    const database = createDatabaseClient();
    const [row] = await database.select(selection).from(emergencyContacts).innerJoin(pets, eq(emergencyContacts.petId, pets.id)).where(and(eq(emergencyContacts.id, contactId), this.ownership(petId, accountId))).limit(1);
    return row ? serialize(row) : null;
  }

  async count(petId: string, accountId: string) {
    const database = createDatabaseClient();
    const [result] = await database.select({ value: count() }).from(emergencyContacts).innerJoin(pets, eq(emergencyContacts.petId, pets.id)).where(this.ownership(petId, accountId));
    return result?.value ?? 0;
  }

  async create(petId: string, accountId: string, input: EmergencyContactInput) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      // The caller has already proven pet/account ownership; this mutation is
      // scoped to that pet inside the same transaction.
      if (input.isPrimary) await tx.update(emergencyContacts).set({ isPrimary: false, updatedAt: new Date() }).where(eq(emergencyContacts.petId, petId));
      const [row] = await tx.insert(emergencyContacts).values({ petId, ...input }).returning();
      return serialize(row);
    });
  }

  async update(contactId: string, petId: string, accountId: string, input: EmergencyContactInput) {
    const database = createDatabaseClient();
    return database.transaction(async (tx) => {
      const [owned] = await tx.select({ id: emergencyContacts.id }).from(emergencyContacts).innerJoin(pets, eq(emergencyContacts.petId, pets.id)).where(and(eq(emergencyContacts.id, contactId), this.ownership(petId, accountId))).limit(1);
      if (!owned) return null;
      if (input.isPrimary) await tx.update(emergencyContacts).set({ isPrimary: false, updatedAt: new Date() }).where(and(eq(emergencyContacts.petId, petId), eq(emergencyContacts.isPrimary, true)));
      const [row] = await tx.update(emergencyContacts).set({ ...input, updatedAt: new Date() }).where(and(eq(emergencyContacts.id, contactId), eq(emergencyContacts.petId, petId))).returning();
      return row ? serialize(row) : null;
    });
  }

  async delete(contactId: string, petId: string, accountId: string) {
    const database = createDatabaseClient();
    const owned = await this.find(contactId, petId, accountId);
    if (!owned) return false;
    const [row] = await database.delete(emergencyContacts).where(and(eq(emergencyContacts.id, contactId), eq(emergencyContacts.petId, petId))).returning({ id: emergencyContacts.id });
    return Boolean(row);
  }
}
