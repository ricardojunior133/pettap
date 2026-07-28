"use server";

import { z } from "zod";

import {
  OrderReadService,
  type CustomerOrderViewModel,
  type CustomerOrderDetailViewModel,
  type CustomerOrdersPageViewModel,
} from "@/features/commerce/services/order-read-service";

const listOrdersInput = z.object({
  page: z.number().int().positive().max(10_000).optional(),
});

const orderNumberInput = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9-]+$/, "Enter a valid order number.");

/** Read-only, authenticated, owner-scoped order list. */
export async function getCustomerOrders(input: unknown = {}): Promise<CustomerOrdersPageViewModel> {
  return new OrderReadService().listOrders(listOrdersInput.parse(input));
}

/** Read-only, authenticated, owner-scoped order lookup. */
export async function getCustomerOrder(orderNumber: unknown): Promise<CustomerOrderViewModel | null> {
  return new OrderReadService().getOrder(orderNumberInput.parse(orderNumber));
}

/** Read-only, authenticated, owner-scoped customer order detail. */
export async function getCustomerOrderDetail(orderNumber: unknown): Promise<CustomerOrderDetailViewModel | null> {
  return new OrderReadService().getOrderDetail(orderNumberInput.parse(orderNumber));
}
