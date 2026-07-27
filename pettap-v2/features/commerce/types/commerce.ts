export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "in_production"
  | "ready_to_ship"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export type ProductionStatus =
  | "not_started"
  | "queued"
  | "printing"
  | "quality_check"
  | "completed"
  | "failed"
  | "cancelled";

export type FulfilmentStatus =
  | "unfulfilled"
  | "queued"
  | "in_production"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  fulfilmentStatus: string;
  currency: string;
  grandTotalMinor: number;
  createdAt: string;
}

export interface OrderLineInput {
  quantity: number;
  unitPriceMinor: number;
}
