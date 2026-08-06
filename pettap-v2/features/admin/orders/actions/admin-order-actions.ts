"use server";

import { revalidatePath } from "next/cache";
import { addOrderNoteSchema, changeOrderStatusSchema, createFulfilmentSchema, shipOrderSchema, updateFulfilmentStatusSchema, updateProductionStatusSchema } from "../schemas/admin-order-actions";
import { AdminOrderService } from "../services/admin-order-service";

export type AdminOrderActionState = { status: "success" | "error"; message: string } | null;
const value = (formData: FormData, key: string) => formData.get(key) ?? undefined;
const fail = (message: string): AdminOrderActionState => ({ status: "error", message });

export async function changeAdminOrderStatusAction(_: AdminOrderActionState, formData: FormData): Promise<AdminOrderActionState> {
  const parsed = changeOrderStatusSchema.safeParse({ orderId: value(formData, "orderId"), nextStatus: value(formData, "nextStatus"), reason: value(formData, "reason"), confirmation: value(formData, "confirmation") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Review the order status change.");
  try { await new AdminOrderService().changeStatus(parsed.data); } catch { return fail("The order status could not be updated."); }
  revalidatePath(`/admin/orders/${parsed.data.orderId}`); revalidatePath("/admin/orders"); return { status: "success", message: "Order status updated." };
}

export async function updateAdminFulfilmentStatusAction(_: AdminOrderActionState, formData: FormData): Promise<AdminOrderActionState> {
  const parsed = updateFulfilmentStatusSchema.safeParse({ orderId: value(formData, "orderId"), nextStatus: value(formData, "nextStatus"), confirmation: value(formData, "confirmation") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Review the fulfilment change.");
  try { await new AdminOrderService().updateFulfilmentStatus(parsed.data); } catch { return fail("The fulfilment status could not be updated."); }
  revalidatePath(`/admin/orders/${parsed.data.orderId}`); revalidatePath("/admin/orders"); revalidatePath("/admin");
  return { status: "success", message: "Fulfilment status updated." };
}

export async function updateAdminProductionStatusAction(_: AdminOrderActionState, formData: FormData): Promise<AdminOrderActionState> {
  const parsed = updateProductionStatusSchema.safeParse({ orderId: value(formData, "orderId"), nextStatus: value(formData, "nextStatus"), confirmation: value(formData, "confirmation") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Review the production update.");
  try { await new AdminOrderService().updateProductionStatus(parsed.data); } catch { return fail("The production status could not be updated."); }
  revalidatePath("/admin/production"); revalidatePath("/admin/packing"); revalidatePath(`/admin/orders/${parsed.data.orderId}`); revalidatePath("/admin");
  return { status: "success", message: "Production status updated." };
}

export async function shipAdminOrderAction(_: AdminOrderActionState, formData: FormData): Promise<AdminOrderActionState> {
  const parsed = shipOrderSchema.safeParse({ orderId: value(formData, "orderId"), trackingNumber: value(formData, "trackingNumber"), confirmation: value(formData, "confirmation") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Enter a valid tracking number.");
  try { await new AdminOrderService().shipOrder(parsed.data); } catch { return fail("The order could not be marked as shipped."); }
  revalidatePath("/admin/shipping"); revalidatePath(`/admin/orders/${parsed.data.orderId}`); revalidatePath("/admin");
  return { status: "success", message: "Order marked as shipped." };
}

export async function addAdminOrderNoteAction(_: AdminOrderActionState, formData: FormData): Promise<AdminOrderActionState> {
  const parsed = addOrderNoteSchema.safeParse({ orderId: value(formData, "orderId"), body: value(formData, "body") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Review the internal note.");
  try { await new AdminOrderService().addNote(parsed.data); } catch { return fail("The note could not be saved."); }
  revalidatePath(`/admin/orders/${parsed.data.orderId}`); return { status: "success", message: "Internal note added." };
}

export async function createAdminFulfilmentAction(_: AdminOrderActionState, formData: FormData): Promise<AdminOrderActionState> {
  const parsed = createFulfilmentSchema.safeParse({ orderId: value(formData, "orderId"), provider: value(formData, "provider"), trackingNumber: value(formData, "trackingNumber"), trackingUrl: value(formData, "trackingUrl"), confirmation: value(formData, "confirmation") });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Review the fulfilment details.");
  try { await new AdminOrderService().createFulfilment(parsed.data); } catch { return fail("The fulfilment could not be created."); }
  revalidatePath(`/admin/orders/${parsed.data.orderId}`); revalidatePath("/admin/fulfilments"); return { status: "success", message: "Fulfilment created." };
}
