import { z } from "zod";

import { addressInputSchema } from "@/features/commerce/schemas/address";
import { findCollectionModel, isCollectionId, isCollectionModel } from "@/lib/domain/collections";
import { isCanonicalStudioModel } from "@/lib/studio/options";

export const guestCheckoutConfigurationSchema = z.object({
  collection: z.string(),
  season: z.enum(["christmas", "halloween", "easter"]).optional(),
  shape: z.string(),
  colour: z.enum(["black", "white", "blue", "green", "purple", "pink", "orange", "red"]),
  lineColour: z.enum(["white", "silver", "gold", "black"]).default("white"),
  primaryColour: z.enum(["black", "white", "blue", "green", "purple", "pink", "orange", "red"]).optional(),
  accentColour: z.enum(["white", "silver", "gold", "black"]).optional(),
  size: z.enum(["petite", "classic", "explorer"]),
  finish: z.enum(["matte", "gloss"]),
  petName: z.string().trim().optional().default(""),
}).strict().superRefine((value, context) => {
  const canonicalStudioModel = isCanonicalStudioModel(value.collection, value.shape);
  if (!canonicalStudioModel && !isCollectionId(value.collection)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["collection"], message: "Unknown collection." });
  if (!canonicalStudioModel && !isCollectionModel(value.collection, value.shape)) context.addIssue({ code: z.ZodIssueCode.custom, path: ["shape"], message: "This model is not available in the selected collection." });
  if (value.collection === "seasonal" && !value.season) context.addIssue({ code: z.ZodIssueCode.custom, path: ["season"], message: "Choose a seasonal group." });
  if (value.collection === "seasonal" && value.season && findCollectionModel(value.collection, value.shape)?.season !== value.season) context.addIssue({ code: z.ZodIssueCode.custom, path: ["shape"], message: "This model is not available in the selected season." });
  if ((value.collection === "essential" || canonicalStudioModel) && !value.petName) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["petName"], message: "A pet name is required for Essential tags." });
  }
  if ((value.collection === "essential" || canonicalStudioModel) && value.petName.length > 12) {
    context.addIssue({ code: z.ZodIssueCode.too_big, maximum: 12, inclusive: true, origin: "string", path: ["petName"], message: "Pet names can contain up to 12 characters." });
  }
  if ((value.primaryColour ?? value.colour) === (value.accentColour ?? value.lineColour)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["accentColour"], message: "Primary Colour and Accent Colour must be different." });
  }
}).transform((value) => isCanonicalStudioModel(value.collection, value.shape) || value.collection === "essential"
  ? { ...value, season: undefined }
  : value.collection === "seasonal" ? { ...value, petName: "" } : { ...value, petName: "", season: undefined });

const guestShippingAddressSchema = z.object({
  fullName: z.unknown(), company: z.unknown().optional(), addressLine1: z.unknown(), addressLine2: z.unknown().optional(),
  city: z.unknown(), county: z.unknown().optional(), postcode: z.unknown(), countryCode: z.unknown(), phone: z.unknown().optional(),
}).strict().transform((value, context) => {
  const parsed = addressInputSchema.safeParse({ ...value, type: "shipping", isDefault: false });
  if (!parsed.success) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid shipping address." });
    return z.NEVER;
  }
  return {
    fullName: parsed.data.fullName,
    company: parsed.data.company,
    addressLine1: parsed.data.addressLine1,
    addressLine2: parsed.data.addressLine2,
    city: parsed.data.city,
    county: parsed.data.county,
    postcode: parsed.data.postcode,
    countryCode: parsed.data.countryCode,
    phone: parsed.data.phone,
  };
});

export const guestCheckoutCustomerSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  fullName: z.string().trim().min(1).max(120),
  shippingAddress: guestShippingAddressSchema,
}).strict();

/** Browser input deliberately excludes price, totals, currency and SKU. */
export const createGuestCheckoutAttemptSchema = z.object({
  configuration: guestCheckoutConfigurationSchema,
  customer: guestCheckoutCustomerSchema,
}).strict();

export type GuestCheckoutConfigurationInput = z.infer<typeof guestCheckoutConfigurationSchema>;
export type GuestCheckoutCustomerInput = z.infer<typeof guestCheckoutCustomerSchema>;
export type CreateGuestCheckoutAttemptInput = z.infer<typeof createGuestCheckoutAttemptSchema>;
