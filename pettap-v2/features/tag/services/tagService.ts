import { DEFAULT_CONFIGURATION, generateSku, getTagPrice } from "@/src/lib/domain/tag";
import type { PetTagConfiguration } from "@/types/tag";

export function getDefaultTagConfiguration() {
  return DEFAULT_CONFIGURATION;
}

export function getTagSummary(configuration: PetTagConfiguration) {
  return { sku: generateSku(configuration), price: getTagPrice(configuration) };
}
