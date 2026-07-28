import "server-only";

import { getAuthenticatedAccountId } from "./commerce-account-service";

import {
  DrizzleOrderRepository,
  type CustomerOrderDetailRecord,
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

const PERSONALISATION_FIELDS = [
  "collection",
  "petName",
  "colour",
  "lineColour",
  "primaryColour",
  "accentColour",
  "font",
  "shape",
  "size",
  "finish",
  "material",
] as const;

export type CustomerOrderItemDetailViewModel = {
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  personalisation: Partial<Record<(typeof PERSONALISATION_FIELDS)[number], string>>;
};

export type CustomerOrderDetailViewModel = {
  orderNumber: string;
  createdAt: string;
  status: CustomerOrderStatusLabel;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  items: CustomerOrderItemDetailViewModel[];
  tracking: {
    carrier: string | null;
    number: string;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
};

const pageSize = 12;

/** Maps only canonical persisted status fields to customer-facing labels. */
export function toCustomerOrderStatus(record: Pick<CustomerOrderReadRecord, "status" | "fulfilmentStatus"> & { productionStatuses?: readonly string[] }): CustomerOrderStatusLabel {
  if (record.status === "cancelled" || record.status === "refunded" || record.fulfilmentStatus === "cancelled") return "Cancelled";
  if (record.fulfilmentStatus === "delivered" || record.status === "completed") return "Delivered";
  if (record.fulfilmentStatus === "shipped" || record.status === "shipped") return "Shipped";
  if (record.fulfilmentStatus === "ready" || record.status === "ready_to_ship") return "Packed";
  if (record.productionStatuses?.some((status) => status === "quality_check" || status === "completed")) return "Printed";
  if (record.productionStatuses?.some((status) => status === "queued" || status === "printing")) return "In Production";
  if (record.status === "in_production" || record.fulfilmentStatus === "in_production") return "In Production";

  return "Paid";
}

export function sanitizeOrderPersonalisation(value: unknown): CustomerOrderItemDetailViewModel["personalisation"] {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;

  return Object.fromEntries(
    PERSONALISATION_FIELDS.flatMap((field) => typeof source[field] === "string" ? [[field, source[field]]] : []),
  ) as CustomerOrderItemDetailViewModel["personalisation"];
}

/** Integer minor-unit validation only; persisted totals remain the authority. */
export function hasConsistentOrderTotals(record: Pick<CustomerOrderDetailRecord["order"], "subtotalMinor" | "discountTotalMinor" | "shippingTotalMinor" | "taxTotalMinor" | "totalMinor">) {
  return record.subtotalMinor + record.shippingTotalMinor + record.taxTotalMinor - record.discountTotalMinor === record.totalMinor;
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

function toDetailViewModel(record: CustomerOrderDetailRecord): CustomerOrderDetailViewModel {
  const productionStatuses = record.items.map((item) => item.productionStatus);
  const status = toCustomerOrderStatus({
    status: record.order.status,
    fulfilmentStatus: record.order.fulfilmentStatus,
    productionStatuses,
  });

  return {
    orderNumber: record.order.orderNumber,
    createdAt: record.order.createdAt.toISOString(),
    status,
    currency: record.order.currency,
    subtotal: record.order.subtotalMinor,
    discountTotal: record.order.discountTotalMinor,
    shippingTotal: record.order.shippingTotalMinor,
    taxTotal: record.order.taxTotalMinor,
    total: record.order.totalMinor,
    items: record.items.map((item) => ({
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPriceMinor,
      lineTotal: item.lineTotalMinor,
      personalisation: sanitizeOrderPersonalisation(item.personalisation),
    })),
    tracking: record.fulfilment?.trackingNumber ? {
      carrier: record.fulfilment.carrier,
      number: record.fulfilment.trackingNumber,
      shippedAt: record.fulfilment.shippedAt?.toISOString() ?? null,
      deliveredAt: record.fulfilment.deliveredAt?.toISOString() ?? null,
    } : null,
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

  async getOrderDetail(orderNumber: string): Promise<CustomerOrderDetailViewModel | null> {
    const normalizedOrderNumber = orderNumber.trim();
    if (!/^[A-Za-z0-9-]{1,80}$/.test(normalizedOrderNumber)) return null;

    const record = await this.repository.getOrderDetailByNumber(await this.resolveAccountId(), normalizedOrderNumber);
    return record ? toDetailViewModel(record) : null;
  }
}
