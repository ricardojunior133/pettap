import { z } from "zod";

export const orderItemPersonalisationSchema = z.object({
  collection: z.string().trim().min(1).max(64).optional(),
  petName: z.string().trim().min(1).max(24).optional(),
  colour: z.string().trim().min(1).max(64).optional(),
  lineColour: z.string().trim().min(1).max(64).optional(),
  primaryColour: z.string().trim().min(1).max(64).optional(),
  accentColour: z.string().trim().min(1).max(64).optional(),
  font: z.string().trim().min(1).max(64).optional(),
  shape: z.string().trim().min(1).max(64).optional(),
  size: z.string().trim().min(1).max(64).optional(),
  finish: z.string().trim().min(1).max(64).optional(),
  material: z.string().trim().min(1).max(64).optional(),
}).strict();

export type OrderItemPersonalisationInput = z.infer<typeof orderItemPersonalisationSchema>;
