import "server-only";

import { getAuthenticatedAccountId, type AccountResolver } from "@/features/pets/services/pet-service";

import { DrizzleCustomerOrderRepository, type CustomerOrderDetailRecord, type CustomerOrderRepository } from "../repositories/customer-order-repository";
import type { CustomerOrderAddressSnapshotViewModel, CustomerOrderDetailViewModel, CustomerOrderItemViewModel, CustomerOrderPageViewModel } from "../types/customer-orders";

const PERSONALISATION_FIELDS = ["collection", "petName", "colour", "font", "shape", "size", "finish", "material"] as const;

function sanitizeSnapshot(value: unknown): CustomerOrderAddressSnapshotViewModel | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const required = ["fullName", "addressLine1", "city", "postcode", "countryCode"] as const;
  if (required.some((field) => typeof source[field] !== "string")) return null;
  return { fullName: source.fullName as string, company: typeof source.company === "string" ? source.company : null, addressLine1: source.addressLine1 as string, addressLine2: typeof source.addressLine2 === "string" ? source.addressLine2 : null, city: source.city as string, county: typeof source.county === "string" ? source.county : null, postcode: source.postcode as string, countryCode: source.countryCode as string };
}

function sanitizePersonalisation(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return Object.fromEntries(PERSONALISATION_FIELDS.flatMap((field) => typeof source[field] === "string" ? [[field, source[field]]] : []));
}

function safeTrackingUrl(value: string | null): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null; } catch { return null; }
}

function toDetail(record: CustomerOrderDetailRecord): CustomerOrderDetailViewModel {
  const { order, fulfilment } = record;
  const timeline = [{ label: "Payment received", occurredAt: order.createdAt.toISOString() }];
  for (const event of record.history ?? []) timeline.push({ label: ({ in_production: "Production started", ready_to_ship: "Packed and ready to ship", shipped: "Shipped", completed: "Delivered", cancelled: "Order cancelled" } as Record<string, string>)[event.newStatus] ?? event.newStatus.replaceAll("_", " "), occurredAt: event.createdAt.toISOString() });
  if (fulfilment?.shippedAt) timeline.push({ label: "Order dispatched", occurredAt: fulfilment.shippedAt.toISOString() });
  if (fulfilment?.deliveredAt) timeline.push({ label: "Order delivered", occurredAt: fulfilment.deliveredAt.toISOString() });
  return { orderNumber: order.orderNumber, customerName: order.customerName, createdAt: order.createdAt.toISOString(), status: order.status, paymentStatus: order.paymentStatus, fulfilmentStatus: order.fulfilmentStatus, currency: order.currency, subtotalMinor: order.subtotalMinor, discountTotalMinor: order.discountTotalMinor, shippingTotalMinor: order.shippingTotalMinor, taxTotalMinor: order.taxTotalMinor, totalMinor: order.totalMinor, shippingAddressSnapshot: sanitizeSnapshot(order.shippingAddressSnapshot), items: record.items.map((item): CustomerOrderItemViewModel => ({ productName: item.productName, variantName: item.variantName, sku: item.sku, quantity: item.quantity, unitPriceMinor: item.unitPriceMinor, lineTotalMinor: item.lineTotalMinor, personalisation: sanitizePersonalisation(item.personalisation) })), tracking: fulfilment?.trackingNumber ? { number: fulfilment.trackingNumber, carrier: fulfilment.provider, url: safeTrackingUrl(fulfilment.trackingUrl), status: fulfilment.status } : null, timeline };
}

export class CustomerOrderService {
  constructor(private readonly repository: CustomerOrderRepository = new DrizzleCustomerOrderRepository(), private readonly resolveAccountId: AccountResolver = getAuthenticatedAccountId) {}

  async list(input: { page?: number; query?: string } = {}): Promise<CustomerOrderPageViewModel> {
    const pageSize = 12;
    const page = Math.max(1, Math.floor(input.page ?? 1));
    const result = await this.repository.listByAccount(await this.resolveAccountId(), { page, pageSize, query: input.query?.slice(0, 80) });
    return { orders: result.rows.map((order) => ({ orderId: order.orderId, orderNumber: order.orderNumber, createdAt: order.createdAt.toISOString(), status: order.status, paymentStatus: order.paymentStatus, fulfilmentStatus: order.fulfilmentStatus, totalMinor: order.totalMinor, currency: order.currency, itemCount: order.itemCount, trackingSummary: order.trackingSummary })), page, pageSize, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / pageSize)) };
  }

  async getById(orderId: string): Promise<CustomerOrderDetailViewModel | null> {
    const normalizedId = orderId.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(normalizedId)) return null;
    const record = await this.repository.getByIdForAccount(await this.resolveAccountId(), normalizedId);
    return record ? toDetail(record) : null;
  }
}
