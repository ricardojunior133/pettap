import { z } from "zod";

import { orderItemPersonalisationSchema } from "./personalisation";

/** Client input contains only a selected variant and personalisation. Prices, totals, ownership and statuses are server-derived. */
export const draftOrderItemInputSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  personalisation: orderItemPersonalisationSchema.optional(),
}).strict();

export const draftOrderInputSchema = z.object({
  items: z.array(draftOrderItemInputSchema).min(1).max(10),
  shippingMethodCode: z.string().trim().min(1).max(64).optional(),
}).strict();

export type DraftOrderInput = z.infer<typeof draftOrderInputSchema>;
