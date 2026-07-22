import { DEFAULT_CONFIGURATION, getPriceForSize, getTagPrice } from "@/src/lib/domain/tag";
import type { PetTagConfiguration } from "@/types/tag";

import { ORDER_DRAFT_VERSION, type CustomerDetails, type CustomPurchase, type EssentialPurchase, type EssentialSelection, type OrderDraft, type Purchase } from "./types";

const storageKey = "pettap-order-draft";

export const EMPTY_CUSTOMER_DETAILS: CustomerDetails = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  townOrCity: "",
  county: "",
  postcode: "",
  country: "United Kingdom",
};

function now() {
  return new Date().toISOString();
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isConfiguration(value: unknown): value is PetTagConfiguration {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.petName === "string" && typeof item.design === "string" && typeof item.size === "string" && typeof item.colour === "string" && typeof item.material === "string" && typeof item.finish === "string" && typeof item.engravingFont === "string" && typeof item.engravingIcon === "string";
}

function isPurchase(value: unknown): value is Purchase {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (item.type === "custom") return isConfiguration(item.configuration);
  if (item.type !== "essential" || !item.selection || typeof item.selection !== "object") return false;
  const selection = item.selection as Record<string, unknown>;
  return typeof selection.colour === "string" && typeof selection.size === "string" && (selection.finish === "matte" || selection.finish === "gloss");
}

export function createEssentialPurchase(selection: EssentialSelection): EssentialPurchase {
  const product = getPriceForSize(selection.size);
  return { type: "essential", selection: { ...selection }, price: { currency: "GBP", product, delivery: null, total: null } };
}

export function createCustomPurchase(configuration: PetTagConfiguration): CustomPurchase {
  const product = getTagPrice(configuration);
  return { type: "custom", configuration: { ...configuration }, price: { currency: "GBP", product, delivery: null, total: null } };
}

export function toPreviewConfiguration(purchase: Purchase): PetTagConfiguration {
  return purchase.type === "custom" ? purchase.configuration : { ...DEFAULT_CONFIGURATION, colour: purchase.selection.colour, size: purchase.selection.size, finish: purchase.selection.finish };
}

export function createOrderDraft(purchase: Purchase): OrderDraft {
  const timestamp = now();
  return { version: ORDER_DRAFT_VERSION, id: createId(), purchase, customer: { ...EMPTY_CUSTOMER_DETAILS }, deliveryMethod: null, createdAt: timestamp, updatedAt: timestamp };
}

export function saveOrderDraft(draft: OrderDraft) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(storageKey, JSON.stringify({ ...draft, updatedAt: now() })); } catch { /* Storage can be unavailable in private browsing. */ }
}

export function readOrderDraft(): OrderDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const draft = value as Partial<OrderDraft>;
    if (draft.version !== ORDER_DRAFT_VERSION || typeof draft.id !== "string" || !isPurchase(draft.purchase) || !draft.customer || typeof draft.customer !== "object" || typeof draft.createdAt !== "string" || typeof draft.updatedAt !== "string") return null;
    return { ...draft, customer: { ...EMPTY_CUSTOMER_DETAILS, ...draft.customer } } as OrderDraft;
  } catch { return null; }
}

export function updateOrderDraft(draft: OrderDraft, updates: Partial<Pick<OrderDraft, "customer" | "deliveryMethod" | "purchase">>): OrderDraft {
  const next = { ...draft, ...updates, customer: updates.customer ? { ...draft.customer, ...updates.customer } : draft.customer, updatedAt: now() };
  saveOrderDraft(next);
  return next;
}

export function clearOrderDraft() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(storageKey); } catch { /* Ignore unavailable storage. */ }
}
