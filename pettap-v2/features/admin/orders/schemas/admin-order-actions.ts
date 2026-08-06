import { z } from "zod";

const orderId = z.string().uuid();

export const adminOrderSearchSchema = z.object({
  query: z.string().trim().max(80).default(""),
  status: z.enum(["all", "draft", "pending_payment", "paid", "in_production", "ready_to_ship", "shipped", "completed", "cancelled", "refunded"]).default("all"),
  paymentStatus: z.enum(["all", "unpaid", "pending", "paid", "partially_refunded", "refunded", "failed", "cancelled"]).default("all"),
  fulfilmentStatus: z.enum(["all", "unfulfilled", "queued", "in_production", "ready", "shipped", "delivered", "cancelled"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateFulfilmentStatusSchema = z.object({
  orderId,
  nextStatus: z.enum(["in_production", "ready", "shipped", "delivered", "cancelled"]),
  confirmation: z.literal("UPDATE FULFILMENT"),
}).strict();

export const updateProductionStatusSchema = z.object({
  orderId,
  nextStatus: z.enum(["printing", "completed"]),
  confirmation: z.literal("UPDATE PRODUCTION"),
}).strict();

export const shipOrderSchema = z.object({
  orderId,
  trackingNumber: z.string().trim().min(3).max(120),
  confirmation: z.literal("MARK SHIPPED"),
}).strict();

export const changeOrderStatusSchema = z.object({
  orderId,
  nextStatus: z.enum(["draft", "pending_payment", "paid", "in_production", "ready_to_ship", "shipped", "completed", "cancelled", "refunded"]),
  reason: z.string().trim().max(500).optional(),
  confirmation: z.literal("CHANGE STATUS"),
}).strict();

export const addOrderNoteSchema = z.object({ orderId, body: z.string().trim().min(1).max(2000) }).strict();
export const createFulfilmentSchema = z.object({ orderId, provider: z.string().trim().max(80).optional(), trackingNumber: z.string().trim().max(120).optional(), trackingUrl: z.string().url().max(1000).optional(), confirmation: z.literal("CREATE FULFILMENT") }).strict();
export const dispatchFulfilmentSchema = z.object({ fulfilmentId: z.string().uuid(), shippedAt: z.coerce.date(), confirmation: z.literal("DISPATCH") }).strict();

export type AdminOrderSearchInput = z.infer<typeof adminOrderSearchSchema>;
export type UpdateFulfilmentStatusInput = z.infer<typeof updateFulfilmentStatusSchema>;
export type UpdateProductionStatusInput = z.infer<typeof updateProductionStatusSchema>;
export type ShipOrderInput = z.infer<typeof shipOrderSchema>;
export type ChangeOrderStatusInput = z.infer<typeof changeOrderStatusSchema>;
export type AddOrderNoteInput = z.infer<typeof addOrderNoteSchema>;
export type CreateFulfilmentInput = z.infer<typeof createFulfilmentSchema>;
export type DispatchFulfilmentInput = z.infer<typeof dispatchFulfilmentSchema>;
