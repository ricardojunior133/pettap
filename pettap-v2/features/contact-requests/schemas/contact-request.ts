import { z } from "zod";

const plainText = (maximum: number) => z.string().trim().min(1).max(maximum).refine((value) => !/[<>]/.test(value), "HTML is not allowed.");
const finderEmail = z.string().trim().email().max(150);

/** The public payload is deliberately narrow and contains no pet, tag or account identifier. */
export const createContactRequestSchema = z.object({
  publicCode: z.string().trim().min(3).max(128).regex(/^[A-Za-z0-9_-]+$/),
  finderName: plainText(80),
  finderEmail,
  message: plainText(1000),
  consent: z.literal("accepted"),
}).strict();

export type CreateContactRequestInput = z.infer<typeof createContactRequestSchema>;
