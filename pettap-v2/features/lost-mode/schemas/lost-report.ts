import { z } from "zod";

const nullableText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength)
    .transform((value) => value || null);

export const lostReportInputSchema = z
  .object({
    lastSeenAt: z
      .string()
      .trim()
      .transform((value) => value || null)
      .refine(
        (value) => value === null || !Number.isNaN(Date.parse(value)),
        "Enter a valid date.",
      ),
    lastSeenLocation: nullableText(160),
    publicMessage: nullableText(600),
  })
  .strict();

export const lostReportIdSchema = z.string().uuid();
