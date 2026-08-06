import "server-only";

import { BackendError } from "@/lib/backend/errors";

import type { GuestCheckoutConfigurationInput } from "../schemas/guest-checkout";
import { type CanonicalProductVariant, DrizzleCatalogProductMappingRepository, type CatalogProductMappingRepository } from "../repositories/catalog-product-mapping-repository";
import { calculateGuestCheckoutConfiguration } from "./guest-checkout-pricing";

export type ResolvedProductMapping = CanonicalProductVariant & { finalSku: string };

export class CanonicalProductMappingService {
  constructor(private readonly repository: CatalogProductMappingRepository = new DrizzleCatalogProductMappingRepository()) {}

  async resolve(configuration: GuestCheckoutConfigurationInput): Promise<ResolvedProductMapping> {
    const calculated = calculateGuestCheckoutConfiguration(configuration);
    const product = await this.repository.findActiveVariant({ size: configuration.size, finish: configuration.finish });
    if (!product) throw new BackendError("NOT_FOUND", "This PetTap configuration is not currently available.");
    return { ...product, finalSku: calculated.sku };
  }
}
