import { z } from "zod";

import { petSpecies } from "../types/pet";

const petName = z
  .string()
  .trim()
  .min(2, "Pet name must be at least 2 characters.")
  .max(60, "Pet name must be 60 characters or fewer.");

const species = z.enum(petSpecies, {
  error: "Choose a valid species.",
});

export const petInputSchema = z.object({ name: petName, species });
export const createPetSchema = petInputSchema;
export const updatePetSchema = petInputSchema;
export const petIdSchema = z.uuid("Invalid pet identifier.");

export type PetInputSchema = z.infer<typeof petInputSchema>;
