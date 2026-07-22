import type { DeliveryOption } from "./types";

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "standard", title: "Standard delivery", description: "Delivery timing will be confirmed before ordering opens.", priceLabel: "To be confirmed", price: null, availabilityNote: "Commercial delivery rules are not live yet." },
  { id: "express", title: "Express delivery", description: "Express availability will be confirmed before ordering opens.", priceLabel: "To be confirmed", price: null, availabilityNote: "Commercial delivery rules are not live yet." },
];

export const DELIVERY_NOTICE = "Delivery options are shown for planning only. Final delivery availability, timing and cost will be confirmed before payment is enabled.";
