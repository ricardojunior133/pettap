import "server-only";

import { DrizzleProductRepository, type ActiveProduct, type ProductRepository } from "../repositories/product-repository";

export class CatalogService {
  constructor(private readonly repository: ProductRepository = new DrizzleProductRepository()) {}

  async getActiveProduct(slug: string): Promise<ActiveProduct | null> {
    return this.repository.findActiveBySlug(slug.trim());
  }
}
