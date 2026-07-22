import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
export const ownerRegistrationSchema = z.object({ displayName: z.string().trim().min(2).max(80), email: z.email(), phone: z.string().trim().max(30).optional() });
export const petRegistrationSchema = z.object({ name: z.string().trim().min(1).max(40), species: z.enum(["dog", "cat", "other"]), breed: z.string().trim().max(80).optional(), sex: z.enum(["female", "male", "unknown"]), birthDate: z.string().date().optional(), colour: z.string().trim().max(60).optional(), weightKg: z.coerce.number().positive().max(200).optional(), microchipNumber: z.string().trim().max(64).optional() });
export const emergencyContactSchema = z.object({ name: z.string().trim().min(2).max(80), relationship: z.string().trim().min(2).max(60), phone: z.string().trim().min(5).max(30), email: z.email().optional(), isPrimary: z.boolean() });
export const medicalInfoSchema = z.object({ allergies: optionalText, medications: optionalText, conditions: optionalText, careInstructions: optionalText });
export const profileEditingSchema = petRegistrationSchema.extend({ photoUrl: z.url().optional(), medical: medicalInfoSchema, emergencyContacts: z.array(emergencyContactSchema).max(3) });
export type OwnerRegistrationInput = z.infer<typeof ownerRegistrationSchema>;
export type PetRegistrationInput = z.infer<typeof petRegistrationSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type MedicalInfoInput = z.infer<typeof medicalInfoSchema>;
