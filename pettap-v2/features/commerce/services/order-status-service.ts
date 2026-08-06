import type { OrderStatus } from "../types/commerce";

const transitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["paid", "cancelled"],
  paid: ["in_production", "cancelled", "refunded"],
  in_production: ["ready_to_ship", "cancelled", "refunded"],
  ready_to_ship: ["shipped", "cancelled", "refunded"],
  shipped: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function assertOrderStatusTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrderStatus(from, to)) {
    throw new Error(`Order status cannot transition from ${from} to ${to}.`);
  }
}
