import { canTransitionOrderStatus } from "@/features/commerce/services/order-status-service";
import { orderItemPersonalisationSchema } from "@/features/commerce/schemas/personalisation";
import type { FulfilmentStatus, OrderStatus } from "@/features/commerce/types/commerce";

const fulfilmentTransitions: Readonly<Record<FulfilmentStatus, readonly FulfilmentStatus[]>> = {
  unfulfilled: ["in_production", "ready", "cancelled"],
  queued: ["in_production", "ready", "cancelled"],
  in_production: ["ready", "cancelled"],
  ready: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function assertAdminOrderTransition(current: OrderStatus, next: OrderStatus) {
  if (!canTransitionOrderStatus(current, next)) throw new Error("This order transition is not permitted.");
}

export function assertFulfilmentTransition(current: FulfilmentStatus, next: FulfilmentStatus) {
  if (!fulfilmentTransitions[current].includes(next)) throw new Error("This fulfilment transition is not permitted.");
}

export function orderStatusForFulfilment(status: FulfilmentStatus): OrderStatus {
  const mapping: Record<FulfilmentStatus, OrderStatus> = { unfulfilled: "paid", queued: "paid", in_production: "in_production", ready: "ready_to_ship", shipped: "shipped", delivered: "completed", cancelled: "cancelled" };
  return mapping[status];
}

export function formatAdminMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(amountMinor / 100);
}

export function formatFulfilmentStatus(status: FulfilmentStatus) {
  return ({ unfulfilled: "Paid", queued: "Queued", in_production: "Processing", ready: "Printed", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" } as const)[status];
}

export function parseAdminPersonalisation(value: unknown) {
  const parsed = orderItemPersonalisationSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
