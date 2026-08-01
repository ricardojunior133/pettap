import { z } from "zod";

const petId = z.string().uuid();

export const enableLostModeSchema = z.object({
  petId,
  details: z.string().trim().min(1).max(500).optional(),
}).strict();

export const disableLostModeSchema = z.object({ petId }).strict();

export type EnableLostModeInput = z.infer<typeof enableLostModeSchema>;
export type DisableLostModeInput = z.infer<typeof disableLostModeSchema>;
