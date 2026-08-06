"use client";

import { useActionState } from "react";

import { shipAdminOrderAction, type AdminOrderActionState, updateAdminFulfilmentStatusAction, updateAdminProductionStatusAction } from "../actions/admin-order-actions";

function State({ state }: { state: AdminOrderActionState }) { return state ? <p aria-live="polite" className={`mt-2 text-xs ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{state.message}</p> : null; }

export function ProductionAction({ orderId, action }: { orderId: string; action: "start" | "printed" | "pack" }) {
  const isProduction = action === "start" || action === "printed";
  const [state, formAction, pending] = useActionState(isProduction ? updateAdminProductionStatusAction : updateAdminFulfilmentStatusAction, null);
  const label = action === "start" ? "Start production" : action === "printed" ? "Mark printed" : "Pack order";
  const status = action === "start" ? "printing" : action === "printed" ? "completed" : "ready";
  return <form action={formAction} className="mt-3"><input name="orderId" type="hidden" value={orderId} /><input name="nextStatus" type="hidden" value={status} /><input name="confirmation" type="hidden" value={isProduction ? "UPDATE PRODUCTION" : "UPDATE FULFILMENT"} /><button className="min-h-10 rounded-lg bg-neutral-950 px-3 text-xs font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Updating…" : label}</button><State state={state} /></form>;
}

export function ShippingAction({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(shipAdminOrderAction, null);
  return <form action={action} className="mt-3 space-y-2"><input name="orderId" type="hidden" value={orderId} /><input name="confirmation" type="hidden" value="MARK SHIPPED" /><label className="sr-only" htmlFor={`tracking-${orderId}`}>Tracking number</label><input className="min-h-10 w-full rounded-lg border border-black/10 px-3 text-sm" id={`tracking-${orderId}`} name="trackingNumber" placeholder="Tracking number" required /><p className="text-xs text-neutral-500">Shipping label generation is prepared for a carrier integration.</p><button className="min-h-10 rounded-lg bg-neutral-950 px-3 text-xs font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving…" : "Mark shipped"}</button><State state={state} /></form>;
}
