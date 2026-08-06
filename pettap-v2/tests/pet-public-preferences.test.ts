import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { petPublicPreferencesInputSchema, privatePetPublicPreferences } from "@/features/pets/schemas/pet-public-preferences";

const repositorySource = readFileSync(resolve(process.cwd(), "features/pets/repositories/pet-public-preferences-repository.ts"), "utf8");
const actionSource = readFileSync(resolve(process.cwd(), "features/pets/actions/pet-public-preferences-actions.ts"), "utf8");
const publicRepositorySource = readFileSync(resolve(process.cwd(), "features/public-tags/repositories/public-tag-repository.ts"), "utf8");
const publicServiceSource = readFileSync(resolve(process.cwd(), "features/public-tags/services/public-tag-service.ts"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "db/migrations/0007_customer_privacy_controls.sql"), "utf8");

const allowed = {
  publicProfileEnabled: true,
  showPhoto: true,
  showName: true,
  showBreed: true,
  showAge: true,
  showMedicalConditions: true,
  showMedications: true,
  showPrimaryContact: true,
  showEmergencyContacts: true,
  showSpecialInstructions: true,
};

describe("pet public privacy defaults and validation", () => {
  it("keeps every consent private by default", () => {
    expect(privatePetPublicPreferences).toEqual({
      showPhoto: false, showName: false, showBreed: false, showAge: false, showMedicalConditions: false,
      showMedications: false, showPrimaryContact: false, showEmergencyContacts: false, showSpecialInstructions: false,
    });
    expect(migration).toContain('"show_name" boolean NOT NULL DEFAULT false');
  });

  it("accepts exactly the nine boolean preferences and the global switch", () => {
    expect(petPublicPreferencesInputSchema.parse(allowed)).toEqual(allowed);
    expect(petPublicPreferencesInputSchema.safeParse({ ...allowed, accountId: "account-a" }).success).toBe(false);
    expect(petPublicPreferencesInputSchema.safeParse({ ...allowed, showPhoto: "true" }).success).toBe(false);
  });
});

describe("owner-scoped privacy persistence", () => {
  it("scopes preference lookup and updates to the pet and authenticated account", () => {
    expect(repositorySource).toContain("and(eq(pets.id, petId), eq(pets.accountId, accountId))");
    expect(repositorySource).toContain("async getByPetForAccount(accountId: string, petId: string)");
    expect(repositorySource).toContain("async upsertForPet(accountId: string, petId: string");
  });

  it("does not accept browser account or customer IDs", () => {
    expect(actionSource).not.toContain("accountId");
    expect(actionSource).not.toContain("customerId");
  });

  it("uses explicit pre-migration detection rather than querying a missing table", () => {
    expect(repositorySource).toContain("to_regclass('public.pet_public_preferences')");
    expect(publicRepositorySource).toContain("to_regclass('public.pet_public_preferences')");
  });

  it("audits only permitted privacy metadata", () => {
    expect(repositorySource).toContain('action: "privacy.updated"');
    expect(repositorySource).toContain("changedFields");
    expect(repositorySource).toContain("publicProfileEnabledChanged");
    const auditSection = repositorySource.slice(repositorySource.indexOf('action: "privacy.updated"'), repositorySource.indexOf("return updated", repositorySource.indexOf('action: "privacy.updated"')));
    for (const pii of ["name", "phone", "email", "storagePath", "medications", "conditions"]) expect(auditSection).not.toContain(`${pii}:`);
  });
});

describe("public resolver consent contract", () => {
  it("uses the global switch as a hard stop and defaults an absent record to private", () => {
    expect(publicServiceSource).toContain("if (!result.pet.publicProfileEnabled");
    expect(publicServiceSource).toContain("result.preferences ?? privatePreferences");
  });

  it("creates a signed URL only after photo consent", () => {
    const photoSection = publicServiceSource.slice(publicServiceSource.indexOf("if (preferences.showPhoto)"), publicServiceSource.indexOf("const resolution"));
    expect(photoSection).toContain("findPrimaryPhotoPath");
    expect(photoSection).toContain("createSignedUrl");
  });

  it("keeps medical, medication and instructions consent independent", () => {
    expect(publicServiceSource).toContain("preferences.showMedicalConditions");
    expect(publicServiceSource).toContain("preferences.showMedications");
    expect(publicServiceSource).toContain("preferences.showSpecialInstructions");
  });

  it("keeps primary and emergency contacts separate", () => {
    expect(publicServiceSource).toContain("preferences.showPrimaryContact");
    expect(publicServiceSource).toContain("preferences.showEmergencyContacts");
    expect(publicServiceSource).toContain("contacts.filter((contact) => !contact.isPrimary)");
  });

  it("does not expose storage paths or internal ownership through the public view model", () => {
    expect(publicRepositorySource.slice(publicRepositorySource.indexOf("async find(tagId"), publicRepositorySource.indexOf("async findPrimaryPhotoPath"))).not.toContain("storagePath");
    expect(publicServiceSource).not.toContain("accountId");
    expect(publicServiceSource).not.toContain("activationCode");
  });
});
