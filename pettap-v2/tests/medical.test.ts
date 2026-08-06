import { describe, expect, it } from "vitest";

import { medicalInformationSchema } from "@/features/medical/schemas/medical";
import { decryptMedicalPayload, encryptMedicalPayload } from "@/features/medical/services/medical-crypto";
import { MedicalService } from "@/features/medical/services/medical-service";
import type { MedicalRepository, StoredMedicalInformation } from "@/features/medical/repositories/medical-repository";
import { vaccinationInputSchema } from "@/features/vaccinations/schemas/vaccination";
import { VaccinationService } from "@/features/vaccinations/services/vaccination-service";
import type { VaccinationRepository } from "@/features/vaccinations/repositories/vaccination-repository";

const petId = "a189f4ac-a86b-424e-963a-2f5720811c30";
const key = Buffer.alloc(32, 7);
const medicalInput = { conditions: "Arthritis", medications: null, allergies: null, careInstructions: "Gentle walks" };
const authorize = async () => ({ pet: { id: petId } });

describe("medical profile", () => {
  it("converts empty optional fields to null", () => {
    expect(medicalInformationSchema.parse({ conditions: "", medications: "", allergies: "", careInstructions: "" })).toEqual({ conditions: null, medications: null, allergies: null, careInstructions: null });
  });

  it("encrypts and decrypts the JSON payload", () => {
    expect(decryptMedicalPayload(encryptMedicalPayload(medicalInput, key), key)).toEqual(medicalInput);
  });

  it("creates then updates one profile per authorized pet", async () => {
    let record: StoredMedicalInformation | null = null;
    const repository: MedicalRepository = {
      async findMedicalInformation() { return record; },
      async createMedicalInformation(id, encryptedPayload) { record = { petId: id, encryptedPayload, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01") }; return record; },
      async updateMedicalInformation(id, encryptedPayload) { record = { petId: id, encryptedPayload, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-02") }; return record; },
      async deleteMedicalInformation() { return true; },
    };
    process.env.MEDICAL_ENCRYPTION_KEY = key.toString("base64");
    const service = new MedicalService(repository, authorize);
    expect((await service.saveMedicalInformation(petId, medicalInput)).conditions).toBe("Arthritis");
    expect((await service.saveMedicalInformation(petId, { ...medicalInput, allergies: "Pollen" })).allergies).toBe("Pollen");
  });
});

describe("vaccinations", () => {
  it("validates dates and optional expiry", () => {
    expect(vaccinationInputSchema.parse({ name: "Rabies", administeredAt: "2026-01-01", expiresAt: "" }).expiresAt).toBeNull();
    expect(() => vaccinationInputSchema.parse({ name: "Rabies", administeredAt: "2026-02-01", expiresAt: "2026-01-01" })).toThrow();
  });

  it("does not update or delete an inaccessible vaccination", async () => {
    const repository: VaccinationRepository = {
      async listVaccinations() { return []; }, async findVaccination() { return null; },
      async createVaccination() { throw new Error("unused"); }, async updateVaccination() { return null; }, async deleteVaccination() { return false; },
    };
    const service = new VaccinationService(repository, authorize);
    const vaccinationId = "b189f4ac-a86b-424e-963a-2f5720811c30";
    expect(await service.updateVaccination(petId, vaccinationId, { name: "Rabies", administeredAt: "2026-01-01", expiresAt: null })).toBeNull();
    expect(await service.deleteVaccination(petId, vaccinationId)).toBe(false);
  });
});
