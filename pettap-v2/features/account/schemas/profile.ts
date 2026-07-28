import { z } from "zod";

export const customerProfileInputSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your name.").max(120),
  phone: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(32).nullable(),
  ),
}).strict();

export type CustomerProfileInput = z.infer<typeof customerProfileInputSchema>;
