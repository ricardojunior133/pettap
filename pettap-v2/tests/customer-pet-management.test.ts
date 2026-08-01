import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { customerPetInputSchema } from "@/features/account/schemas/customer-pet";

describe("Customer pet management foundation", () => {
  it("validates only the supported editable pet fields", () => {
    const result=customerPetInputSchema.parse({name:"Charlie",species:"dog",breed:"Pug",birthDate:"2023-01-02",sex:"male",weight:"8.5",colour:"Fawn"});
    expect(result).toMatchObject({name:"Charlie",species:"dog",breed:"Pug",sex:"male"});
    expect(customerPetInputSchema.safeParse({...result,accountId:"other-account"}).success).toBe(false);
  });
  it("keeps the persisted profile and photo queries owner-scoped", () => {
    const repository=readFileSync(resolve(process.cwd(),"features/account/repositories/customer-pet-management-repository.ts"),"utf8");
    expect(repository).toContain("eq(pets.accountId,accountId)");
    expect(repository).toContain("eq(pets.publicId,publicId)");
    expect(repository).toContain("eq(petPhotos.petId,pet.id)");
  });
  it("adds profile fields while preserving private storage policies", () => {
    const migration=readFileSync(resolve(process.cwd(),"db/migrations/0017_pet_management_profile_fields.sql"),"utf8");
    const storage=readFileSync(resolve(process.cwd(),"db/migrations/0002_pet_photo_storage_security.sql"),"utf8");
    expect(migration).toContain("birth_date");
    expect(migration).toContain("pets_weight_positive_check");
    expect(storage).toContain("can_manage_pet_photo_path");
  });
});
