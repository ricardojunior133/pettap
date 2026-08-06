import Link from "next/link";

import { ProductionAction } from "@/features/admin/orders/components/admin-production-actions";
import { AdminOrderService } from "@/features/admin/orders/services/admin-order-service";

type Stage = "waiting" | "processing" | "printed" | "ready";
const stageTitle: Record<Stage, string> = { waiting: "Waiting", processing: "Processing", printed: "Printed", ready: "Ready to ship" };

export default async function AdminProductionPage() {
  const queue = await new AdminOrderService().productionQueue();
  const columns: Record<Stage, typeof queue> = { waiting: [], processing: [], printed: [], ready: [] };
  for (const order of queue) {
    const stage: Stage = order.fulfilmentStatus === "ready" ? "ready" : order.productionStatus === "completed" ? "printed" : order.productionStatus === "printing" || order.status === "in_production" ? "processing" : "waiting";
    columns[stage].push(order);
  }
  return <><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Operations</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">Production centre</h1><p className="mt-3 text-neutral-600">Oldest paid orders are shown first. Production never changes payment status.</p></header><section className="mt-8 grid gap-5 xl:grid-cols-4">{(Object.keys(columns) as Stage[]).map((stage) => <div className="rounded-3xl border border-black/[.07] bg-white p-4" key={stage}><div className="flex items-center justify-between"><h2 className="font-semibold">{stageTitle[stage]}</h2><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500">{columns[stage].length}</span></div><div className="mt-4 space-y-3">{columns[stage].map((order) => <article className="rounded-2xl border border-black/[.07] p-4" key={order.id}><Link className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href={`/admin/orders/${order.id}`}><p className="font-semibold">{order.orderNumber}</p><p className="mt-1 text-sm text-neutral-700">{order.petName ?? "Pet name pending"}</p><p className="mt-2 text-xs text-neutral-500">{order.collection ?? "—"} {order.shape ?? "—"} · {order.colour ?? "—"}</p><p className="text-xs text-neutral-500">{order.size ?? "—"} · {order.finish ?? "—"} · Qty {order.quantity}</p><p className="mt-2 text-xs text-neutral-400">Paid {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(order.createdAt)}</p></Link>{stage === "waiting" ? <ProductionAction orderId={order.id} action="start" /> : stage === "processing" ? <ProductionAction orderId={order.id} action="printed" /> : stage === "printed" ? <ProductionAction orderId={order.id} action="pack" /> : null}</article>)}{!columns[stage].length ? <p className="py-8 text-center text-sm text-neutral-500">No orders here.</p> : null}</div></div>)}</section></>;
}
