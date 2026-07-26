import { z } from "zod";

const trimToNull = (maximum: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(maximum).nullable().optional(),
).transform((value) => value ?? null);

export const eventDemoTagStatusSchema = z.enum(["available", "in_progress", "completed", "expired", "disabled"]);
export const eventDemoSessionStatusSchema = z.enum(["started", "profile_created", "completed", "expired", "deleted"]);
export const eventDemoSpeciesSchema = z.enum(["dog", "cat", "other"]);
export const leadSourceSchema = z.enum(["coming_soon", "event_demo", "fair", "manual"]);
export const eventDemoPublicCodeSchema = z.string().regex(/^demo_[A-Za-z0-9_-]{16}$/);
export const eventDemoPublicIdSchema = z.string().regex(/^ed_[A-Za-z0-9_-]{24}$/);
export const eventDemoSessionDurationSchema = z.number().int().min(10).max(240);

export const createEventDemoTagSchema = z.object({
  internalName: z.string().trim().min(1).max(100),
  sessionDurationMinutes: eventDemoSessionDurationSchema.default(60),
}).strict();

export const createEventDemoTagBatchSchema = z.object({
  internalNamePrefix: z.string().trim().min(1).max(80),
  sessionDurationMinutes: eventDemoSessionDurationSchema.default(60),
  quantity: z.coerce.number().int().min(1).max(20),
}).strict();

export const eventDemoAdminIdSchema = z.string().uuid();
export const eventDemoCleanupSchema = z.object({ limit: z.coerce.number().int().min(1).max(100).default(25) }).strict();
export const eventDemoLeadSearchSchema = z.object({ email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()) }).strict();

export const updateEventDemoTagStatusSchema = z.object({ status: eventDemoTagStatusSchema }).strict();

export const createEventDemoSessionSchema = z.object({
  demoTagId: z.string().uuid(),
  expiresAt: z.coerce.date(),
}).strict();

export const eventDemoPetDataSchema = z.object({
  petName: trimToNull(60),
  species: eventDemoSpeciesSchema.nullable().optional().transform((value) => value ?? null),
  breed: trimToNull(80),
  age: trimToNull(40),
  personality: trimToNull(240),
}).strict();

export const eventDemoVisibilityPreferencesSchema = z.object({
  showOwnerFirstName: z.boolean().default(false),
  showTelephone: z.boolean().default(false),
  showEmail: z.boolean().default(false),
  showBreed: z.boolean().default(false),
  showAge: z.boolean().default(false),
  showPersonality: z.boolean().default(false),
}).strict();

export const eventDemoConsentSchema = z.object({
  demoConsentAccepted: z.literal(true),
  demoConsentVersion: z.string().trim().min(1).max(40),
  marketingConsent: z.boolean().default(false),
  marketingConsentVersion: trimToNull(40),
}).strict();

export const eventDemoSessionPatchSchema = z.object({
  petName: trimToNull(60).optional(),
  species: eventDemoSpeciesSchema.nullable().optional(),
  breed: trimToNull(80).optional(),
  age: trimToNull(40).optional(),
  personality: trimToNull(240).optional(),
  ownerFirstName: trimToNull(80).optional(),
  contactTelephone: trimToNull(40).optional(),
  contactEmail: z.preprocess((value) => typeof value === "string" && value.trim() === "" ? null : value, z.string().trim().email().max(254).nullable().optional()).transform((value) => value ? value.toLowerCase() : null).optional(),
  visibility: eventDemoVisibilityPreferencesSchema.optional(),
  demoConsentAccepted: z.boolean().optional(),
  demoConsentVersion: trimToNull(40).optional(),
  marketingConsent: z.boolean().optional(),
  marketingConsentVersion: trimToNull(40).optional(),
}).strict();

export const leadSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  firstName: trimToNull(80),
  source: leadSourceSchema,
  marketingConsent: z.boolean(),
  consentVersion: trimToNull(40),
}).strict();

export type CreateEventDemoTagInput = z.infer<typeof createEventDemoTagSchema>;
export type CreateEventDemoTagBatchInput = z.infer<typeof createEventDemoTagBatchSchema>;
export type EventDemoPetDataInput = z.infer<typeof eventDemoPetDataSchema>;
export type EventDemoVisibilityPreferencesInput = z.infer<typeof eventDemoVisibilityPreferencesSchema>;
export type EventDemoConsentInput = z.infer<typeof eventDemoConsentSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type EventDemoSessionPatchInput = z.infer<typeof eventDemoSessionPatchSchema>;
