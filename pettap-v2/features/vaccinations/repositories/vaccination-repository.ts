import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { vaccinations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { Vaccination, VaccinationInput } from "../types/vaccination";

const selection = {
  id: vaccinations.id,
  petId: vaccinations.petId,
  name: vaccinations.name,
  administeredAt: vaccinations.administeredAt,
  expiresAt: vaccinations.expiresAt,
};

function serialize(record: { id: string; petId: string; name: string; administeredAt: Date; expiresAt: Date | null }): Vaccination {
  return { id: record.id, petId: record.petId, name: record.name, administeredAt: record.administeredAt.toISOString().slice(0, 10), expiresAt: record.expiresAt?.toISOString().slice(0, 10) ?? null };
}

export interface VaccinationRepository {
  listVaccinations(petId: string): Promise<Vaccination[]>;
  findVaccination(vaccinationId: string, petId: string): Promise<Vaccination | null>;
  createVaccination(petId: string, input: VaccinationInput): Promise<Vaccination>;
  updateVaccination(vaccinationId: string, petId: string, input: VaccinationInput): Promise<Vaccination | null>;
  deleteVaccination(vaccinationId: string, petId: string): Promise<boolean>;
}

export class DrizzleVaccinationRepository implements VaccinationRepository {
  async listVaccinations(petId: string) {
    const database = createDatabaseClient();
    const records = await database.select(selection).from(vaccinations).where(eq(vaccinations.petId, petId)).orderBy(asc(vaccinations.administeredAt));
    return records.map(serialize);
  }

  async findVaccination(vaccinationId: string, petId: string) {
    const database = createDatabaseClient();
    const [record] = await database.select(selection).from(vaccinations).where(and(eq(vaccinations.id, vaccinationId), eq(vaccinations.petId, petId))).limit(1);
    return record ? serialize(record) : null;
  }

  async createVaccination(petId: string, input: VaccinationInput) {
    const database = createDatabaseClient();
    const [record] = await database.insert(vaccinations).values({ petId, name: input.name, administeredAt: new Date(`${input.administeredAt}T12:00:00.000Z`), expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T12:00:00.000Z`) : null }).returning(selection);
    return serialize(record);
  }

  async updateVaccination(vaccinationId: string, petId: string, input: VaccinationInput) {
    const database = createDatabaseClient();
    const [record] = await database.update(vaccinations).set({ name: input.name, administeredAt: new Date(`${input.administeredAt}T12:00:00.000Z`), expiresAt: input.expiresAt ? new Date(`${input.expiresAt}T12:00:00.000Z`) : null }).where(and(eq(vaccinations.id, vaccinationId), eq(vaccinations.petId, petId))).returning(selection);
    return record ? serialize(record) : null;
  }

  async deleteVaccination(vaccinationId: string, petId: string) {
    const database = createDatabaseClient();
    const [record] = await database.delete(vaccinations).where(and(eq(vaccinations.id, vaccinationId), eq(vaccinations.petId, petId))).returning({ id: vaccinations.id });
    return Boolean(record);
  }
}
