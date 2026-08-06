import "server-only";

import { and, eq } from "drizzle-orm";

import { productPrices, products, productVariants } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export interface CanonicalProductVariant {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitAmountMinor: number;
  currency: "GBP";
}

export interface CatalogProductMappingRepository {
  findActiveVariant(input: { size: string; finish: string }): Promise<CanonicalProductVariant | null>;
}

/** Resolves only active, GBP catalogue records — UI display data is never trusted. */
export class DrizzleCatalogProductMappingRepository implements CatalogProductMappingRepository {
  async findActiveVariant(input: { size: string; finish: string }): Promise<CanonicalProductVariant | null> {
    const database = createDatabaseClient();
    const [row] = await database
      .select({
        productId: products.id,
        variantId: productVariants.id,
        productName: products.name,
        variantName: productVariants.name,
        sku: productVariants.sku,
        unitAmountMinor: productPrices.unitAmountMinor,
        currency: productPrices.currency,
      })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .innerJoin(productPrices, eq(productPrices.variantId, productVariants.id))
      .where(and(
        eq(productVariants.size, input.size),
        eq(productVariants.finish, input.finish),
        eq(productVariants.status, "active"),
        eq(products.status, "active"),
        eq(productPrices.status, "active"),
        eq(productPrices.currency, "GBP"),
      ))
      .orderBy(productPrices.createdAt)
      .limit(1);
    return row ? { ...row, currency: "GBP" } : null;
  }
}
