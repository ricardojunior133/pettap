import { z } from "zod";

export const petSpecies = ["dog", "cat", "other"] as const;
export const petSex = ["male", "female", "unknown"] as const;

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

export const customerPetInputSchema = z.object({
  name: z.string().trim().min(1, "Enter your pet's name.").max(80),
  species: z.enum(petSpecies),
  breed: optionalText(80),
  birthDate: z.string().trim().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use a valid date.").transform((value) => value || null),
  sex: z.enum(petSex).optional().transform((value) => value ?? null),
  weight: z.string().trim().refine((value) => !value || (Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 999.99), "Use a valid weight.").transform((value) => value || null),
  colour: optionalText(60),
}).strict();

export const petPublicIdentifierSchema = z.string().trim().min(1).max(120).regex(/^[A-Za-z0-9_-]+$/);
export type CustomerPetInput = z.infer<typeof customerPetInputSchema>;
