import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";
import { TransactionalNotificationService } from "@/features/transactional-notifications/service";
import { DrizzleAdminOrderRepository } from "../repositories/admin-order-repository";
import { assertAdminOrderTransition, assertFulfilmentTransition } from "./admin-order-domain";
import type { AddOrderNoteInput, AdminOrderSearchInput, ChangeOrderStatusInput, CreateFulfilmentInput, DispatchFulfilmentInput, ShipOrderInput, UpdateFulfilmentStatusInput, UpdateProductionStatusInput } from "../schemas/admin-order-actions";

export class AdminOrderNotFoundError extends Error {}
export class AdminOrderService {
  constructor(private readonly repository = new DrizzleAdminOrderRepository()) {}
  async search(input: AdminOrderSearchInput) { await requireAdminPermission("orders.read"); return this.repository.search(input); }
  async productionQueue() { await requireAdminPermission("production.read"); return this.repository.productionQueue(); }
  async detail(orderId: string) { await requireAdminPermission("orders.read"); const result = await this.repository.detail(orderId); if (!result) throw new AdminOrderNotFoundError(); return result; }
  private async notify(orderId: string, type: "production_started" | "printed" | "packed" | "shipped" | "delivered" | "order_cancelled") {
    try {
      await new TransactionalNotificationService().sendTransactionalNotification({ orderId, type });
    } catch {
      // Notifications are operationally useful, but cannot reverse a committed order update.
    }
  }
  async changeStatus(input: ChangeOrderStatusInput) { const actor = await requireAdminPermission("orders.update_status"); const detail = await this.detail(input.orderId); assertAdminOrderTransition(detail.order.status, input.nextStatus); const result = await this.repository.changeStatus(input.orderId, input.nextStatus, actor.accountId, input.reason); if (!result || result === "conflict") throw new AdminOrderNotFoundError(); if (input.nextStatus === "cancelled") await this.notify(input.orderId, "order_cancelled"); return result; }
  async updateFulfilmentStatus(input: UpdateFulfilmentStatusInput) {
    const actor = await requireAdminPermission("orders.update_status");
    const detail = await this.detail(input.orderId);
    const latest = detail.fulfilments[0];
    assertFulfilmentTransition(latest?.status ?? "unfulfilled", input.nextStatus);
    const result = await this.repository.updateFulfilmentStatus(input.orderId, input.nextStatus, actor.accountId);
    if (!result || result === "conflict") throw new AdminOrderNotFoundError();
    const notification = input.nextStatus === "ready" ? "packed" : input.nextStatus === "shipped" ? "shipped" : input.nextStatus === "delivered" ? "delivered" : null;
    if (notification) await this.notify(input.orderId, notification);
    return result;
  }
  async updateProductionStatus(input: UpdateProductionStatusInput) {
    const actor = await requireAdminPermission("production.update");
    const result = await this.repository.updateProductionStatus(input.orderId, input.nextStatus, actor.accountId);
    if (!result) throw new AdminOrderNotFoundError();
    await this.notify(input.orderId, input.nextStatus === "printing" ? "production_started" : "printed");
    return result;
  }
  async shipOrder(input: ShipOrderInput) {
    const actor = await requireAdminPermission("fulfilments.dispatch");
    const result = await this.repository.shipOrder(input.orderId, input.trackingNumber, actor.accountId);
    if (!result || result === "conflict") throw new AdminOrderNotFoundError();
    await this.notify(input.orderId, "shipped");
    return result;
  }
  async addNote(input: AddOrderNoteInput) { const actor = await requireAdminPermission("orders.add_internal_note"); const result = await this.repository.addNote(input.orderId, actor.accountId, input.body); if (!result) throw new AdminOrderNotFoundError(); return result; }
  async createFulfilment(input: CreateFulfilmentInput) { const actor = await requireAdminPermission("fulfilments.create"); const result = await this.repository.createFulfilment(input.orderId, actor.accountId, input); if (!result) throw new AdminOrderNotFoundError(); return result; }
  async dispatch(input: DispatchFulfilmentInput) { const actor = await requireAdminPermission("fulfilments.dispatch"); const result = await this.repository.dispatchFulfilment(input.fulfilmentId, actor.accountId, input.shippedAt); if (!result) throw new AdminOrderNotFoundError(); await this.notify(result.orderId, "shipped"); return result; }
  async fulfilments() { await requireAdminPermission("fulfilments.read"); return this.repository.listFulfilments(); }
  async fulfilment(fulfilmentId: string) { await requireAdminPermission("fulfilments.read"); const result = await this.repository.findFulfilment(fulfilmentId); if (!result) throw new AdminOrderNotFoundError(); return result; }
}
