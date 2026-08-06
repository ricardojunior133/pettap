import { z } from "zod";

export const supportedProfileLanguages = ["en-GB"] as const;

const nullablePhone = z
  .preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().min(3).max(32).nullable().optional(),
  )
  .transform((value) => value?.replace(/\s+/g, " ") ?? null);

export const customerProfileInputSchema = z
  .object({
    displayName: z.string().trim().min(1, "Enter your name.").max(120),
    phone: nullablePhone,
    preferredLanguage: z.enum(supportedProfileLanguages),
  })
  .strict();

export type CustomerProfileInput = z.infer<typeof customerProfileInputSchema>;

export type CustomerProfileViewModel = {
  displayName: string;
  email: string;
  phone: string | null;
  preferredLanguage: (typeof supportedProfileLanguages)[number];
};
