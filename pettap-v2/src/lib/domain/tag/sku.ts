import type { PetTagConfiguration } from "./types";

export function generateSku(
  config: PetTagConfiguration
) {
  return `PET-${config.design}-${config.size}`.toUpperCase();
}
