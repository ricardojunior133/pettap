import { notFound } from "next/navigation";

import { AdminOrderNotFoundError, AdminOrderService } from "@/features/admin/orders/services/admin-order-service";

async function loadFulfilment(fulfilmentId: string) { try { return await new AdminOrderService().fulfilment(fulfilmentId); } catch (error) { if (error instanceof AdminOrderNotFoundError) notFound(); throw error; } }

export default async function AdminFulfilmentDetailPage({ params }: { params: Promise<{ fulfilmentId: string }> }) { const { fulfilmentId } = await params; const item = await loadFulfilment(fulfilmentId); return <><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">Fulfilment</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">{item.provider ?? "Carrier pending"}</h1><dl className="mt-8 grid gap-4 rounded-3xl border border-black/[.07] bg-white p-6 sm:grid-cols-2"><div><dt className="text-sm text-neutral-500">Status</dt><dd className="mt-1 font-semibold capitalize">{item.status}</dd></div><div><dt className="text-sm text-neutral-500">Tracking number</dt><dd className="mt-1 font-semibold">{item.trackingNumber ?? "Not assigned"}</dd></div></dl></>; }
