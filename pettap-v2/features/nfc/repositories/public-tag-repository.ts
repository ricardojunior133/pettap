import "server-only";

import { and, eq } from "drizzle-orm";

import { lostReports, nfcTags, pets, petPhotos, petPublicPreferences, tagActivations } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export type PublicLostReportRecord = { id: string; petId: string; tagId: string; openedAt: Date; status: "open" };
export type PublicTagRecord = {
  tagId: string;
  status: string;
  accountId: string | null;
  petId: string | null;
  pet: null | { id: string; accountId: string; name: string; species: string; breed: string | null; birthDate: string | null; publicProfileEnabled: boolean; archivedAt: Date | null };
  preferences: null | { showName: boolean; showBreed: boolean; showPhoto: boolean; showAge: boolean; publicMessage: string | null };
  photoPath: string | null;
  activationCount: number;
  lostReport: PublicLostReportRecord | null;
};

/** Read model deliberately excludes credentials, contacts, medical payloads and administrative data. */
export class PublicTagRepository {
  async findOpenLostReportForTag(tagId: string): Promise<PublicLostReportRecord | null> {
    const database = createDatabaseClient();
    const reports = await database.select({ id: lostReports.id, petId: lostReports.petId, tagId: lostReports.tagId, openedAt: lostReports.openedAt, status: lostReports.status })
      .from(lostReports).where(and(eq(lostReports.tagId, tagId), eq(lostReports.status, "open"))).limit(2);
    if (reports.length !== 1) return null;
    const [report] = reports;
    return { id: report.id, petId: report.petId, tagId: report.tagId!, openedAt: report.openedAt, status: "open" };
  }

  async findByPublicCode(publicCode: string): Promise<PublicTagRecord | null> {
    const database = createDatabaseClient();
    const [tag] = await database.select().from(nfcTags).where(eq(nfcTags.publicId, publicCode)).limit(1);
    if (!tag) return null;
    const [pet] = tag.petId ? await database.select().from(pets).where(eq(pets.id, tag.petId)).limit(1) : [];
    const [preferences] = pet ? await database.select({
      showName: petPublicPreferences.showName,
      showBreed: petPublicPreferences.showBreed,
      showPhoto: petPublicPreferences.showPhoto,
      showAge: petPublicPreferences.showAge,
      publicMessage: petPublicPreferences.publicMessage,
    }).from(petPublicPreferences).where(eq(petPublicPreferences.petId, pet.id)).limit(1) : [];
    const [photo] = pet ? await database.select({ storagePath: petPhotos.storagePath }).from(petPhotos)
      .where(and(eq(petPhotos.petId, pet.id), eq(petPhotos.isPrimary, true))).limit(1) : [];
    const activations = await database.select({ id: tagActivations.id }).from(tagActivations).where(eq(tagActivations.tagId, tag.id));
    const lostReport = tag.status === "lost" ? await this.findOpenLostReportForTag(tag.id) : null;
    return {
      tagId: tag.id,
      status: tag.status,
      accountId: tag.accountId,
      petId: tag.petId,
      pet: pet ? { id: pet.id, accountId: pet.accountId, name: pet.name, species: pet.species, breed: pet.breed, birthDate: pet.birthDate, publicProfileEnabled: pet.publicProfileEnabled, archivedAt: pet.archivedAt } : null,
      preferences: preferences ?? null,
      photoPath: photo?.storagePath ?? null,
      activationCount: activations.length,
      lostReport,
    };
  }
}
