import { z } from "zod";

export const customerInputSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(32).optional().nullable(),
}).strict();

export type CustomerInput = z.infer<typeof customerInputSchema>;
