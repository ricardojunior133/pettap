import type { PetTagConfiguration } from "./types";
import type { TagSize } from "@/types/tag";

const PRICE = {
  petite: 19.99,
  classic: 24.99,
  explorer: 29.99,
};

export function getTagPrice(
  config: PetTagConfiguration
) {
  return getPriceForSize(config.size);
}

export function getPriceForSize(size: TagSize) {
  return PRICE[size];
}
