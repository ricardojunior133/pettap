import "server-only";

import { getAuthenticatedAccountId } from "@/features/pets/services/pet-service";

import { DrizzleOrderRepository, type OrderRepository } from "../repositories/order-repository";
import type { OrderSummary } from "../types/commerce";

export class OrderReadService {
  constructor(
    private readonly repository: OrderRepository = new DrizzleOrderRepository(),
    private readonly resolveAccountId: () => Promise<string> = getAuthenticatedAccountId,
  ) {}

  async listOrders(): Promise<OrderSummary[]> {
    return this.repository.listByAccountId(await this.resolveAccountId());
  }

  async getOrder(orderNumber: string): Promise<OrderSummary | null> {
    return this.repository.findByOrderNumber(await this.resolveAccountId(), orderNumber.trim());
  }
}
