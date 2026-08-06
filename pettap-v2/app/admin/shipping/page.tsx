import Link from "next/link";

import { ShippingAction } from "@/features/admin/orders/components/admin-production-actions";
import { AdminOrderService } from "@/features/admin/orders/services/admin-order-service";

export default async function AdminShippingPage() {
  const result = await new AdminOrderService().search({ query: "", status: "ready_to_ship", paymentStatus: "paid", fulfilmentStatus: "ready", page: 1, limit: 100 });
  return <><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Operations</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Shipping centre</h1><p className="mt-3 text-neutral-600">Shipping labels are a carrier-integration placeholder. Tracking is stored only when an order is marked shipped.</p></header><section className="mt-8 grid gap-4 lg:grid-cols-2">{result.rows.map((order) => <article className="rounded-3xl border border-black/[.07] bg-white p-6" key={order.id}><p className="font-semibold">{order.orderNumber}</p><p className="mt-2 text-sm text-neutral-700">{order.customerName}</p><p className="text-sm text-neutral-500">{order.customerEmail}</p><p className="mt-3 text-sm text-neutral-600">{order.petName ?? "Pet name pending"} · {order.productName ?? "Product pending"}</p><Link className="mt-4 inline-block text-sm font-semibold underline" href={`/admin/orders/${order.id}`}>View shipping address</Link><ShippingAction orderId={order.id} /></article>)}{!result.rows.length ? <p className="rounded-3xl border border-dashed border-black/10 p-10 text-center text-sm text-neutral-500">No packed orders are ready to ship.</p> : null}</section></>;
}
