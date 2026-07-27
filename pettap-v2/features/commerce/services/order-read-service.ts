import "server-only";

import { getAuthenticatedAccountId } from "./commerce-account-service";

import {
  DrizzleOrderRepository,
  type CustomerOrderReadRecord,
  type OrderRepository,
} from "../repositories/order-repository";

export type CustomerOrderStatusLabel =
  | "Paid"
  | "In Production"
  | "Printed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type CustomerOrderViewModel = {
  orderNumber: string;
  createdAt: string;
  status: CustomerOrderStatusLabel;
  total: number;
  currency: string;
  itemCount: number;
  trackingNumber: string | null;
};

export type CustomerOrdersPageViewModel = {
  orders: CustomerOrderViewModel[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CustomerOrdersQuery = {
  page?: number;
};

const pageSize = 12;

/** Maps only canonical persisted status fields to customer-facing labels. */
export function toCustomerOrderStatus(record: Pick<CustomerOrderReadRecord, "status" | "fulfilmentStatus">): CustomerOrderStatusLabel {
  if (record.status === "cancelled" || record.status === "refunded" || record.fulfilmentStatus === "cancelled") return "Cancelled";
  if (record.fulfilmentStatus === "delivered" || record.status === "completed") return "Delivered";
  if (record.fulfilmentStatus === "shipped" || record.status === "shipped") return "Shipped";
  if (record.fulfilmentStatus === "ready" || record.status === "ready_to_ship") return "Packed";
  if (record.status === "in_production" || record.fulfilmentStatus === "in_production") return "In Production";

  return "Paid";
}

function toViewModel(record: CustomerOrderReadRecord): CustomerOrderViewModel {
  return {
    orderNumber: record.orderNumber,
    createdAt: record.createdAt.toISOString(),
    status: toCustomerOrderStatus(record),
    total: record.totalMinor,
    currency: record.currency,
    itemCount: record.itemCount,
    trackingNumber: record.trackingNumber,
  };
}

export class OrderReadService {
  constructor(
    private readonly repository: OrderRepository = new DrizzleOrderRepository(),
    private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId,
  ) {}

  async listOrders({ page = 1 }: CustomerOrdersQuery = {}): Promise<CustomerOrdersPageViewModel> {
    const safePage = Math.max(1, Math.floor(page));
    const result = await this.repository.listOrders(await this.resolveAccountId(), { page: safePage, pageSize });

    return {
      orders: result.rows.map(toViewModel),
      page: safePage,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    };
  }

  async getOrder(orderNumber: string): Promise<CustomerOrderViewModel | null> {
    const record = await this.repository.getOrderByNumber(await this.resolveAccountId(), orderNumber.trim());
    return record ? toViewModel(record) : null;
  }
}
