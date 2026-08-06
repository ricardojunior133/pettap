import "server-only";

import { and, asc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { productPrices, productVariants, products } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export interface ActiveProductVariant {
  id: string;
  sku: string;
  name: string;
  shape: string;
  size: string;
  material: string;
  finish: string;
  priceMinor: number | null;
  currency: string | null;
}

export interface ActiveProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  variants: ActiveProductVariant[];
}

export interface ProductRepository {
  findActiveBySlug(slug: string, now?: Date): Promise<ActiveProduct | null>;
}

export class DrizzleProductRepository implements ProductRepository {
  async findActiveBySlug(slug: string, now = new Date()): Promise<ActiveProduct | null> {
    const database = createDatabaseClient();
    const rows = await database
      .select({
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        description: products.description,
        variantId: productVariants.id,
        sku: productVariants.sku,
        variantName: productVariants.name,
        shape: productVariants.shape,
        size: productVariants.size,
        material: productVariants.material,
        finish: productVariants.finish,
        priceMinor: productPrices.unitAmountMinor,
        currency: productPrices.currency,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(productPrices, and(
        eq(productPrices.variantId, productVariants.id),
        eq(productPrices.status, "active"),
        or(isNull(productPrices.startsAt), lte(productPrices.startsAt, now)),
        or(isNull(productPrices.endsAt), gte(productPrices.endsAt, now)),
      ))
      .where(and(eq(products.slug, slug), eq(products.status, "active"), eq(productVariants.status, "active")))
      .orderBy(asc(productVariants.name));

    if (rows.length === 0) return null;
    const first = rows[0];
    return {
      id: first.productId,
      name: first.productName,
      slug: first.productSlug,
      description: first.description,
      variants: rows.map((row) => ({
        id: row.variantId,
        sku: row.sku,
        name: row.variantName,
        shape: row.shape,
        size: row.size,
        material: row.material,
        finish: row.finish,
        priceMinor: row.priceMinor,
        currency: row.currency,
      })),
    };
  }
}
