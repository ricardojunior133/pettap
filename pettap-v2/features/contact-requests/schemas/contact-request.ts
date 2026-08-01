import { z } from "zod";

const plainText = (maximum: number) => z.string().trim().min(1).max(maximum).refine((value) => !/[<>]/.test(value), "HTML is not allowed.");

/** The public payload is deliberately narrow and contains no pet, tag or account identifier. */
export const createContactRequestSchema = z.object({
  publicCode: z.string().trim().min(3).max(128).regex(/^[A-Za-z0-9_-]+$/),
  finderName: plainText(80),
  finderContact: plainText(150),
  message: plainText(1000),
}).strict();

export type CreateContactRequestInput = z.infer<typeof createContactRequestSchema>;
