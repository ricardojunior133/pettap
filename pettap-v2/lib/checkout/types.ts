import type { PetTagConfiguration, TagFinish, TagSize } from "@/types/tag";

export const ORDER_DRAFT_VERSION = 1 as const;

export type PurchaseType = "essential" | "custom";
export type DeliveryMethodId = "standard" | "express";

export interface EssentialSelection {
  colour: string;
  size: TagSize;
  finish: TagFinish;
}

export interface PriceBreakdown {
  currency: "GBP";
  product: number;
  delivery: number | null;
  total: number | null;
}

export interface EssentialPurchase {
  type: "essential";
  selection: EssentialSelection;
  price: PriceBreakdown;
}

export interface CustomPurchase {
  type: "custom";
  configuration: PetTagConfiguration;
  price: PriceBreakdown;
}

export type Purchase = EssentialPurchase | CustomPurchase;

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  townOrCity: string;
  county: string;
  postcode: string;
  country: string;
}

export interface OrderDraft {
  version: typeof ORDER_DRAFT_VERSION;
  id: string;
  purchase: Purchase;
  customer: CustomerDetails;
  deliveryMethod: DeliveryMethodId | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOption {
  id: DeliveryMethodId;
  title: string;
  description: string;
  priceLabel: string;
  price: number | null;
  availabilityNote: string;
}

export interface PaymentSessionRequest {
  orderDraft: OrderDraft;
}

export interface PaymentSessionResult {
  status: "unavailable" | "ready";
  redirectUrl?: string;
}

export interface CheckoutPaymentProvider {
  createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResult>;
}
