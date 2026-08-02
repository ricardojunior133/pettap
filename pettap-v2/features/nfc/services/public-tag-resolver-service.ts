import "server-only";

import { auditLogs } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";
import { PublicPetPhotoService } from "@/features/pets/services/public-pet-photo-service";

import { PublicTagRepository, type PublicTagRecord } from "../repositories/public-tag-repository";
import { allowPublicTagRequest } from "./public-tag-rate-limit";

export type PublicPetProfileDto = { name?: string; species?: string; breed?: string; age?: string; message?: string; photoUrl?: string };
export type PublicLostPetDto = PublicPetProfileDto & { reportedAt?: string };
export type PublicTagResolution =
  | { state: "not_found" | "not_activated" | "suspended" | "retired" | "unavailable" | "rate_limited" }
  | { state: "active"; profile: PublicPetProfileDto }
  | { state: "lost"; profile: PublicLostPetDto };
export type PublicTagAuditEvent = { state: PublicTagResolution["state"]; tagId: string | null };
export interface PublicTagAuditWriter { write(event: PublicTagAuditEvent): Promise<void> }

export class DatabasePublicTagAuditWriter implements PublicTagAuditWriter {
  async write(event: PublicTagAuditEvent) {
    await createDatabaseClient().insert(auditLogs).values({ action: `public.tag.${event.state}`, targetType: "nfc_tag", targetId: event.tagId, result: "success", metadata: { state: event.state } });
  }
}

function ageFromBirthDate(birthDate: string | null, now = new Date()): string | undefined {
  if (!birthDate) return undefined;
  const birth = new Date(`${birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime()) || birth > now) return undefined;
  let years = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) years -= 1;
  return years < 1 ? "Under 1 year old" : `${years} ${years === 1 ? "year" : "years"} old`;
}

async function profileFor(tag: PublicTagRecord, photos: PublicPetPhotoService): Promise<PublicPetProfileDto> {
  const pet = tag.pet;
  const preferences = tag.preferences;
  if (!pet || !preferences) return {};
  const photoUrl = preferences.showPhoto ? await photos.sign(tag.photoPath) : null;
  return {
    ...(preferences.showName ? { name: pet.name } : {}),
    ...(preferences.showBreed ? { species: pet.species, ...(pet.breed ? { breed: pet.breed } : {}) } : {}),
    ...(preferences.showAge && ageFromBirthDate(pet.birthDate) ? { age: ageFromBirthDate(pet.birthDate) } : {}),
    ...(preferences.publicMessage ? { message: preferences.publicMessage } : {}),
    ...(photoUrl ? { photoUrl } : {}),
  };
}

export class PublicTagResolverService {
  constructor(
    private readonly repository = new PublicTagRepository(),
    private readonly photos = new PublicPetPhotoService(),
    private readonly audit: PublicTagAuditWriter = new DatabasePublicTagAuditWriter(),
    private readonly rateLimit = allowPublicTagRequest,
  ) {}

  async resolveByPublicCode(input: { publicCode: string; ip: string }): Promise<PublicTagResolution> {
    if (!/^[A-Za-z0-9_-]{3,128}$/.test(input.publicCode) || !this.rateLimit(input.ip)) return { state: "rate_limited" };
    const tag = await this.repository.findByPublicCode(input.publicCode);
    let result: PublicTagResolution;
    if (!tag) result = { state: "not_found" };
    else if (tag.status === "unassigned") result = { state: "not_activated" };
    else if (tag.status === "suspended") result = { state: "suspended" };
    else if (tag.status === "retired") result = { state: "retired" };
    else if (!tag.pet || !tag.petId || tag.pet.archivedAt || tag.accountId !== tag.pet.accountId || tag.activationCount !== 1) result = { state: "unavailable" };
    else if (tag.status === "lost") {
      const report = tag.lostReport;
      result = !report || report.status !== "open" || report.petId !== tag.pet.id || report.tagId !== tag.tagId
        ? { state: "unavailable" }
        : !tag.pet.publicProfileEnabled || !tag.preferences
          ? { state: "lost", profile: {} }
          : { state: "lost", profile: { ...await profileFor(tag, this.photos), reportedAt: report.openedAt.toISOString().slice(0, 10) } };
    } else if (tag.status !== "active" || !tag.pet.publicProfileEnabled || !tag.preferences) result = { state: "unavailable" };
    else result = { state: "active", profile: await profileFor(tag, this.photos) };
    try { await this.audit.write({ state: result.state, tagId: tag?.tagId ?? null }); } catch { /* public response remains safe when audit fails */ }
    return result;
  }
}
