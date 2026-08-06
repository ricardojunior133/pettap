import Link from "next/link";
import { Box, Check, Circle, CreditCard, ExternalLink, Package, PartyPopper, Printer, Truck } from "lucide-react";

import type { PublicTrackingTimelineEntry, PublicTrackingViewModel } from "../services/public-order-tracking-service";

const iconByStage = {
  payment_received: CreditCard,
  production_started: Package,
  printed: Printer,
  packed: Box,
  shipped: Truck,
  delivered: PartyPopper,
};

function date(value: string | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function TrackingStep({ entry }: { entry: PublicTrackingTimelineEntry }) {
  const Icon = iconByStage[entry.type];
  const stateLabel = entry.current ? "Current" : entry.completed ? "Completed" : "Pending";
  return <li className="relative flex gap-4 pb-7 last:pb-0">
    <span aria-hidden="true" className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border ${entry.current ? "border-neutral-950 bg-neutral-950 text-white shadow-lg shadow-neutral-950/15" : entry.completed ? "border-neutral-950 bg-white text-neutral-950" : "border-neutral-200 bg-neutral-50 text-neutral-400"}`}>
      {entry.completed ? <Check className="size-4" strokeWidth={2.5} /> : entry.current ? <Icon className="size-4" /> : <Circle className="size-3" fill="currentColor" />}
    </span>
    <div className="min-w-0 pt-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="font-semibold text-neutral-950">{entry.title}</h3><span className="text-xs font-medium text-neutral-500">{stateLabel}</span></div>
      <p className="mt-1 text-sm leading-6 text-neutral-600">{entry.description}</p>
      <time className="mt-1.5 block text-xs font-medium text-neutral-500">{date(entry.occurredAt)}</time>
    </div>
  </li>;
}

export function TrackingNotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f8f8f6] px-5 py-16 text-neutral-950"><section className="w-full max-w-md rounded-[2rem] border border-black/[.07] bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,.06)]"><span aria-hidden="true" className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neutral-100"><Package className="size-5" /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">PetTap tracking</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em]">We couldn&apos;t find that order.</h1><p className="mt-3 text-sm leading-6 text-neutral-600">Check the order number and try again. Our support team can help if you need us.</p><Link className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href="/contact">Contact Support</Link></section></main>;
}

export function PublicOrderTracking({ tracking }: { tracking: PublicTrackingViewModel }) {
  const delivered = tracking.timeline.find((entry) => entry.type === "delivered")?.current;
  const shippingAvailable = Boolean(tracking.shipping.trackingNumber && tracking.shipping.trackingUrl);

  return <main className="min-h-screen bg-[#f8f8f6] px-5 py-10 text-neutral-950 sm:px-8 sm:py-16"><div className="mx-auto max-w-5xl"><header className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">PetTap order tracking</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] sm:text-6xl">Track your PetTap</h1><p className="mt-4 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">Follow every step as we craft your personalised PetTap.</p></header>
    <section aria-labelledby="tracking-status" className="mt-10 rounded-[2rem] border border-black/[.07] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,.05)] sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm text-neutral-500">Order number</p><h2 id="tracking-status" className="mt-1 font-mono text-lg font-semibold tracking-tight text-neutral-950">{tracking.orderNumber}</h2></div><div className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-700">{tracking.status}</div></div><div className="mt-8"><div className="flex items-end justify-between gap-4"><p className="text-sm font-medium text-neutral-700">Order progress</p><p className="text-2xl font-semibold tracking-[-.04em]">{tracking.progress}%</p></div><div aria-label={`${tracking.progress}% complete`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={tracking.progress} className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100" role="progressbar"><div className="h-full rounded-full bg-neutral-950 transition-[width] duration-700 ease-out" style={{ width: `${tracking.progress}%` }} /></div></div></section>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><section className="rounded-[2rem] border border-black/[.07] bg-white p-6 sm:p-8"><h2 className="text-xl font-semibold tracking-[-.04em]">Your PetTap journey</h2><ol className="relative mt-7 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-neutral-200">{tracking.timeline.map((entry) => <TrackingStep entry={entry} key={entry.type} />)}</ol></section><aside className="space-y-6"><section className="rounded-[2rem] border border-black/[.07] bg-white p-6"><p className="text-sm font-medium text-neutral-500">Made for</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.04em]">{tracking.pet.name}</h2><dl className="mt-6 space-y-4 border-t border-black/[.06] pt-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-neutral-500">Design</dt><dd className="text-right font-medium text-neutral-900">{tracking.product.design}</dd></div><div className="flex justify-between gap-4"><dt className="text-neutral-500">Colour</dt><dd className="text-right font-medium text-neutral-900">{tracking.product.colour}</dd></div><div className="flex justify-between gap-4"><dt className="text-neutral-500">Size</dt><dd className="text-right font-medium text-neutral-900">{tracking.product.size}</dd></div></dl></section>
      <section className="rounded-[2rem] border border-black/[.07] bg-white p-6"><div className="flex items-center gap-2"><Truck className="size-4" /><h2 className="font-semibold">Shipping</h2></div>{shippingAvailable ? <><p className="mt-4 text-sm font-medium text-neutral-950">{tracking.shipping.carrier ?? "Carrier"}</p><p className="mt-1 font-mono text-sm text-neutral-600">{tracking.shipping.trackingNumber}</p><a className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href={tracking.shipping.trackingUrl ?? undefined} rel="noreferrer" target="_blank">Track parcel <ExternalLink className="size-4" /></a></> : <p className="mt-4 text-sm leading-6 text-neutral-600">Preparing shipment...</p>}</section>
      {delivered ? <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-6"><PartyPopper aria-hidden="true" className="size-5 text-emerald-700" /><h2 className="mt-4 text-xl font-semibold tracking-[-.04em]">Your PetTap has arrived.</h2><p className="mt-2 text-sm leading-6 text-emerald-950/75">Thank you for trusting PetTap.</p><Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2" href="/activate">Configure your tag</Link></section> : null}</aside></div></div></main>;
}
