import type { PublicLostPetDto } from "./services/public-tag-resolver-service";

export type PublicLostPageView = {
  eyebrow: string;
  headline: string;
  safetyMessage: string;
  genericPetLabel: string;
  name?: string;
  species?: string;
  photoUrl?: string;
  reportedAt?: string;
  futureContactMessage: string;
};

/** Explicit public allowlist: no report entity or private fields enter the page. */
export function presentPublicLostPage(profile: PublicLostPetDto): PublicLostPageView {
  return {
    eyebrow: "PetTap Lost Mode",
    headline: "This pet has been reported missing",
    safetyMessage: "If you have found this pet, please keep them safe.",
    genericPetLabel: "PetTap pet",
    ...(profile.name ? { name: profile.name } : {}),
    ...(profile.species ? { species: profile.species } : {}),
    ...(profile.photoUrl ? { photoUrl: profile.photoUrl } : {}),
    ...(profile.reportedAt ? { reportedAt: profile.reportedAt } : {}),
    futureContactMessage: "Contact options may be available in a future update.",
  };
}
