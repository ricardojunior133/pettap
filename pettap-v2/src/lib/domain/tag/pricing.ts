import type { PetTagConfiguration } from "./types";
import type { TagSize } from "@/types/tag";

/** The single source of truth for base PetTap size prices. */
export const TAG_PRICE_BY_SIZE = {
  petite: 19.99,
  classic: 24.99,
  explorer: 29.99,
} as const;

export function getTagPrice(
  config: PetTagConfiguration
) {
  return getPriceForSize(config.size);
}

export function getPriceForSize(size: TagSize) {
  return TAG_PRICE_BY_SIZE[size];
}
