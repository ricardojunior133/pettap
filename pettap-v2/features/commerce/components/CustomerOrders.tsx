import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Package, Route, Truck } from "lucide-react";

import type { CustomerOrderDetailViewModel, CustomerOrderListItemViewModel, CustomerOrderPageViewModel } from "../types/customer-orders";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value / 100);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "info" }) {
  const tones = { neutral: "bg-neutral-100 text-neutral-700", success: "bg-emerald-50 text-emerald-800", info: "bg-sky-50 text-sky-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function statusTone(status: string): "neutral" | "success" | "info" {
  if (["completed", "delivered"].includes(status)) return "success";
  if (["paid", "in_production", "ready_to_ship", "shipped", "queued"].includes(status)) return "info";
  return "neutral";
}

function OrderCard({ order, basePath }: { order: CustomerOrderListItemViewModel; basePath: string }) {
  return <article className="rounded-3xl border border-black/[0.07] bg-white p-5 shadow-[0_12px_36px_rgba(17,17,17,0.035)] sm:p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Order</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">{order.orderNumber}</h2>
        <p className="mt-1 text-sm text-neutral-600">Placed {date(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
      </div>
      <p className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{money(order.totalMinor, order.currency)}</p>
    </div>
    <div className="mt-5 flex flex-wrap gap-2"><Badge tone={statusTone(order.status)}>{label(order.status)}</Badge><Badge tone={statusTone(order.fulfilmentStatus)}>{label(order.fulfilmentStatus)}</Badge>{order.trackingSummary ? <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"><Truck className="size-3.5" />Tracking available</span> : null}</div>
    <div className="mt-6 border-t border-black/[0.06] pt-4"><Link href={`${basePath}/${order.orderId}`} className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10">View order <ChevronRight className="ml-1 size-4" /></Link></div>
  </article>;
}

export function CustomerOrdersList({ data, basePath = "/dashboard/orders" }: { data: CustomerOrderPageViewModel; basePath?: string }) {
  if (!data.orders.length) return <section className="rounded-[28px] border border-dashed border-black/[0.14] bg-white p-9 text-center sm:p-14"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100"><Package className="size-5 text-neutral-600" /></span><h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-neutral-950">No orders yet</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-600">When you place an order, its production and delivery updates will appear here.</p></section>;
  return <><div className="grid gap-4 lg:grid-cols-2">{data.orders.map((order) => <OrderCard key={order.orderId} order={order} basePath={basePath} />)}</div>{data.totalPages > 1 ? <nav aria-label="Orders pagination" className="mt-8 flex items-center justify-between gap-4"><span className="text-sm text-neutral-600">Page {data.page} of {data.totalPages}</span><div className="flex gap-2">{data.page > 1 ? <Link href={`${basePath}?page=${data.page - 1}`} className="inline-flex min-h-11 items-center rounded-xl border border-black/[0.1] px-3 text-sm font-semibold text-neutral-900"><ChevronLeft className="mr-1 size-4" />Previous</Link> : null}{data.page < data.totalPages ? <Link href={`${basePath}?page=${data.page + 1}`} className="inline-flex min-h-11 items-center rounded-xl border border-black/[0.1] px-3 text-sm font-semibold text-neutral-900">Next<ChevronRight className="ml-1 size-4" /></Link> : null}</div></nav> : null}</>;
}

function AddressSnapshot({ address }: { address: CustomerOrderDetailViewModel["shippingAddressSnapshot"] }) {
  if (!address) return <p className="rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">The delivery address snapshot is not available for this order.</p>;
  return <address className="not-italic text-sm leading-6 text-neutral-700"><p className="font-semibold text-neutral-950">{address.fullName}</p>{address.company ? <p>{address.company}</p> : null}<p>{address.addressLine1}</p>{address.addressLine2 ? <p>{address.addressLine2}</p> : null}<p>{address.city}{address.county ? `, ${address.county}` : ""}</p><p>{address.postcode}, {address.countryCode}</p></address>;
}

export function CustomerOrderDetail({ order, basePath = "/dashboard/orders" }: { order: CustomerOrderDetailViewModel; basePath?: string }) {
  const totals = [["Subtotal", order.subtotalMinor], ["Discount", -order.discountTotalMinor], ["Shipping", order.shippingTotalMinor], ["Tax", order.taxTotalMinor]] as const;
  return <section className="mx-auto max-w-5xl"><Link href={basePath} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10"><ArrowLeft className="size-4" />Back to orders</Link><header className="mt-7 flex flex-col gap-5 border-b border-black/[0.07] pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Order details</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-neutral-950">{order.orderNumber}</h1><p className="mt-3 text-sm text-neutral-600">Placed {date(order.createdAt)}</p></div><p className="text-3xl font-semibold tracking-[-0.05em] text-neutral-950">{money(order.totalMinor, order.currency)}</p></header><div className="mt-6 flex flex-wrap gap-2"><Badge tone={statusTone(order.status)}>{label(order.status)}</Badge><Badge tone={statusTone(order.fulfilmentStatus)}>{label(order.fulfilmentStatus)}</Badge></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><div className="space-y-6"><section className="rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold text-neutral-950">Your items</h2><ul className="mt-5 divide-y divide-black/[0.06]">{order.items.map((item) => <li key={`${item.sku}-${item.variantName}`} className="py-5 first:pt-0 last:pb-0"><div className="flex justify-between gap-4"><div><h3 className="font-semibold text-neutral-950">{item.productName}</h3><p className="mt-1 text-sm text-neutral-600">{item.variantName} · SKU {item.sku}</p><p className="mt-1 text-sm text-neutral-600">Quantity {item.quantity}</p>{Object.keys(item.personalisation).length ? <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-neutral-50 p-3 text-xs">{Object.entries(item.personalisation).map(([key, value]) => <div key={key}><dt className="capitalize text-neutral-500">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="mt-0.5 font-medium text-neutral-800">{value}</dd></div>)}</dl> : null}</div><p className="shrink-0 font-semibold text-neutral-950">{money(item.lineTotalMinor, order.currency)}</p></div></li>)}</ul></section><section className="rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold text-neutral-950">Delivery address</h2><div className="mt-4"><AddressSnapshot address={order.shippingAddressSnapshot} /></div></section></div><aside className="space-y-6"><section className="rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold text-neutral-950">Order summary</h2><dl className="mt-5 space-y-3 text-sm">{totals.map(([name, total]) => <div className="flex justify-between gap-4" key={name}><dt className="text-neutral-600">{name}</dt><dd className="font-medium text-neutral-900">{total < 0 ? "−" : ""}{money(Math.abs(total), order.currency)}</dd></div>)}<div className="flex justify-between gap-4 border-t border-black/[0.07] pt-4 text-base"><dt className="font-semibold text-neutral-950">Total</dt><dd className="font-semibold text-neutral-950">{money(order.totalMinor, order.currency)}</dd></div></dl></section>{order.tracking ? <section className="rounded-3xl border border-sky-100 bg-sky-50/60 p-5 sm:p-6"><div className="flex items-center gap-2 text-sky-800"><Truck className="size-4" /><h2 className="font-semibold">Tracking</h2></div><p className="mt-4 font-medium text-neutral-950">{order.tracking.number}</p><p className="mt-1 text-sm text-neutral-600">{order.tracking.carrier ?? label(order.tracking.status)}</p>{order.tracking.url ? <a className="mt-4 inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-100" href={order.tracking.url} target="_blank" rel="noreferrer">Track delivery <Route className="ml-1.5 size-4" /></a> : null}</section> : null}<section className="rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold text-neutral-950">Order journey</h2><ol className="mt-5 space-y-4">{order.timeline.map((entry) => <li key={`${entry.label}-${entry.occurredAt}`} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-neutral-950" /><div><p className="text-sm font-medium text-neutral-900">{entry.label}</p><time className="mt-1 block text-xs text-neutral-500">{date(entry.occurredAt)}</time></div></li>)}</ol></section></aside></div></section>;
}
