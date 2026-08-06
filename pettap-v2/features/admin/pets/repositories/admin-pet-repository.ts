import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { lostReports, medicalInformation, nfcTags, petPhotos, pets } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export interface AdminPetRecord {
  id: string;
  accountId: string;
  name: string;
  species: string;
  publicId: string;
  createdAt: Date;
  lostModeActive: boolean;
  tagCount: number;
  primaryPhotoPath: string | null;
  medicalInformationPresent: boolean;
}

export interface AdminPetRepository {
  findById(petId: string): Promise<AdminPetRecord | null>;
  listForAccount(accountId: string): Promise<AdminPetRecord[]>;
}

const mapRecord = (row: AdminPetRecord): AdminPetRecord => ({ ...row, tagCount: Number(row.tagCount) });

export class DrizzleAdminPetRepository implements AdminPetRepository {
  async findById(petId: string): Promise<AdminPetRecord | null> {
    const database = createDatabaseClient();
    const tagCount = sql<number>`(select count(*) from ${nfcTags} where ${nfcTags.petId} = ${pets.id})`;
    const [row] = await database.select({
      id: pets.id, accountId: pets.accountId, name: pets.name, species: pets.species, publicId: pets.publicId, createdAt: pets.createdAt,
      lostModeActive: sql<boolean>`exists (select 1 from ${lostReports} where ${lostReports.petId} = ${pets.id} and ${lostReports.status} = 'active')`,
      tagCount,
      primaryPhotoPath: petPhotos.storagePath,
      medicalInformationPresent: sql<boolean>`exists (select 1 from ${medicalInformation} where ${medicalInformation.petId} = ${pets.id})`,
    }).from(pets).leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true))).where(eq(pets.id, petId)).limit(1);
    return row ? mapRecord(row) : null;
  }

  async listForAccount(accountId: string): Promise<AdminPetRecord[]> {
    const database = createDatabaseClient();
    const rows = await database.select({ id: pets.id, accountId: pets.accountId, name: pets.name, species: pets.species, publicId: pets.publicId, createdAt: pets.createdAt, lostModeActive: sql<boolean>`exists (select 1 from ${lostReports} where ${lostReports.petId} = ${pets.id} and ${lostReports.status} = 'active')`, tagCount: sql<number>`(select count(*) from ${nfcTags} where ${nfcTags.petId} = ${pets.id})`, primaryPhotoPath: petPhotos.storagePath, medicalInformationPresent: sql<boolean>`exists (select 1 from ${medicalInformation} where ${medicalInformation.petId} = ${pets.id})` }).from(pets).leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true))).where(eq(pets.accountId, accountId)).orderBy(desc(pets.createdAt));
    return rows.map(mapRecord);
  }
}
