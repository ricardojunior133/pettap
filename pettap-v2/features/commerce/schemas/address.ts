import { z } from "zod";

const nullableOptionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().max(maxLength).nullable().optional(),
  ).transform((value) => value ?? null);

export function normalizeUkPostcode(value: string): string {
  const compact = value.trim().toUpperCase().replace(/\s+/g, "");
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}

export const addressInputSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  fullName: z.string().trim().min(1).max(120),
  company: nullableOptionalText(120),
  addressLine1: z.string().trim().min(1).max(160),
  addressLine2: nullableOptionalText(160),
  city: z.string().trim().min(1).max(120),
  county: nullableOptionalText(120),
  postcode: z.string().trim().min(3).max(16),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  phone: nullableOptionalText(32),
  isDefault: z.boolean().default(false),
}).strict().transform((value) => ({
  ...value,
  postcode: value.countryCode === "GB" ? normalizeUkPostcode(value.postcode) : value.postcode.trim(),
}));

export type AddressInput = z.infer<typeof addressInputSchema>;
