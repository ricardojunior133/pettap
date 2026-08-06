import { z } from "zod";

export const privatePetPublicPreferences = {
  showPhoto: false,
  showName: false,
  showBreed: false,
  showAge: false,
  showMedicalConditions: false,
  showMedications: false,
  showPrimaryContact: false,
  showEmergencyContacts: false,
  showSpecialInstructions: false,
} as const;

export const petPublicPreferencesInputSchema = z.object({
  publicProfileEnabled: z.boolean(),
  ...Object.fromEntries(Object.keys(privatePetPublicPreferences).map((key) => [key, z.boolean()])) as Record<keyof typeof privatePetPublicPreferences, z.ZodBoolean>,
}).strict();

export type PetPublicPreferencesInput = z.infer<typeof petPublicPreferencesInputSchema>;

export type PetPublicPreferencesViewModel = PetPublicPreferencesInput & {
  petId: string;
  available: boolean;
};
