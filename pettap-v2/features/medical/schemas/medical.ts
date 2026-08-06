import { z } from "zod";

function optionalMedicalText(maximum: number) {
  return z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(maximum).nullable(),
  );
}

export const medicalInformationSchema = z.object({
  conditions: optionalMedicalText(1000),
  medications: optionalMedicalText(1000),
  allergies: optionalMedicalText(1000),
  careInstructions: optionalMedicalText(1500),
}).strict();

export type MedicalInformationSchema = z.infer<typeof medicalInformationSchema>;
