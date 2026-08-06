import Link from "next/link";

import { ProductionAction } from "@/features/admin/orders/components/admin-production-actions";
import { AdminOrderService } from "@/features/admin/orders/services/admin-order-service";

export default async function AdminPackingPage() {
  const orders = (await new AdminOrderService().productionQueue()).filter((order) => order.productionStatus === "completed" && order.fulfilmentStatus === "in_production");
  return <><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Operations</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Packing</h1></header><section className="mt-8 grid gap-4 lg:grid-cols-2">{orders.map((order) => <article className="rounded-3xl border border-black/[.07] bg-white p-6" key={order.id}><p className="font-semibold">{order.orderNumber}</p><p className="mt-2 text-sm text-neutral-600">{order.petName ?? "Pet name pending"} · {order.quantity} item(s)</p><Link className="mt-4 inline-block text-sm font-semibold underline" href={`/admin/orders/${order.id}`}>Open order</Link><ProductionAction orderId={order.id} action="pack" /></article>)}{!orders.length ? <p className="rounded-3xl border border-dashed border-black/10 p-10 text-center text-sm text-neutral-500">No printed orders are waiting to be packed.</p> : null}</section></>;
}
