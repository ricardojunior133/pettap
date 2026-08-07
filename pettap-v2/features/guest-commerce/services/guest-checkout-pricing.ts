import { getPriceForSize } from "@/src/lib/domain/tag";

import { isCanonicalStudioModel, studioColours } from "@/lib/studio/options";

import type { GuestCheckoutConfigurationInput } from "../schemas/guest-checkout";

export const GUEST_CHECKOUT_CURRENCY = "GBP" as const;
export const GUEST_CHECKOUT_SHIPPING_MINOR = 299;

const collectionSku: Record<string, string> = {
  essential: "ESS", breed: "BRD", cats: "CAT", nature: "NAT", luxury: "LUX", kids: "KID", celebration: "CEL", seasonal: "SEA", bloom: "BLM", cosmic: "COS", adventure: "ADV", animal: "ANI",
};
const sizeSku: Record<GuestCheckoutConfigurationInput["size"], string> = { petite: "PET", classic: "CLA", explorer: "EXP" };
const finishSku: Record<GuestCheckoutConfigurationInput["finish"], string> = { matte: "MAT", gloss: "GLS" };

export interface ServerCalculatedConfiguration {
  collection: GuestCheckoutConfigurationInput["collection"];
  season?: GuestCheckoutConfigurationInput["season"];
  shape: GuestCheckoutConfigurationInput["shape"];
  colour: GuestCheckoutConfigurationInput["colour"];
  lineColour: GuestCheckoutConfigurationInput["lineColour"];
  primaryColour?: GuestCheckoutConfigurationInput["primaryColour"];
  accentColour?: GuestCheckoutConfigurationInput["accentColour"];
  size: GuestCheckoutConfigurationInput["size"];
  finish: GuestCheckoutConfigurationInput["finish"];
  petName?: string;
  sku: string;
  unitAmountMinor: number;
  quantity: 1;
}

export interface GuestCheckoutAmounts {
  currency: typeof GUEST_CHECKOUT_CURRENCY;
  subtotalMinor: number;
  shippingMinor: typeof GUEST_CHECKOUT_SHIPPING_MINOR;
  totalMinor: number;
}

export function calculateGuestCheckoutConfiguration(input: GuestCheckoutConfigurationInput): ServerCalculatedConfiguration {
  const colour = studioColours.find((item) => item.id === input.colour);
  if (!colour) throw new Error("The selected colour is unavailable.");

  const unitAmountMinor = Math.round(getPriceForSize(input.size) * 100);
  return {
    ...input,
    primaryColour: input.primaryColour ?? input.colour,
    accentColour: input.accentColour ?? input.lineColour,
    ...(input.collection === "essential" || isCanonicalStudioModel(input.collection, input.shape) ? { petName: input.petName.trim() } : { petName: undefined }),
    sku: ["PET", collectionSku[input.collection], input.shape.toUpperCase(), sizeSku[input.size], finishSku[input.finish], colour.sku, input.lineColour.toUpperCase()].join("-"),
    unitAmountMinor,
    quantity: 1,
  };
}

export function calculateGuestCheckoutAmounts(configuration: { unitAmountMinor: number; quantity: number }): GuestCheckoutAmounts {
  const subtotalMinor = configuration.unitAmountMinor * configuration.quantity;
  return {
    currency: GUEST_CHECKOUT_CURRENCY,
    subtotalMinor,
    shippingMinor: GUEST_CHECKOUT_SHIPPING_MINOR,
    totalMinor: subtotalMinor + GUEST_CHECKOUT_SHIPPING_MINOR,
  };
}
