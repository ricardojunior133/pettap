"use client";

import { useActionState } from "react";

import { addAdminOrderNoteAction, type AdminOrderActionState, updateAdminFulfilmentStatusAction } from "../actions/admin-order-actions";

const transitions = {
  unfulfilled: [{ value: "in_production", label: "Mark as processing" }, { value: "cancelled", label: "Cancel order" }],
  queued: [{ value: "in_production", label: "Mark as processing" }, { value: "cancelled", label: "Cancel order" }],
  in_production: [{ value: "ready", label: "Mark as printed" }, { value: "cancelled", label: "Cancel order" }],
  ready: [{ value: "shipped", label: "Mark as shipped" }, { value: "cancelled", label: "Cancel order" }],
  shipped: [{ value: "delivered", label: "Mark as delivered" }],
  delivered: [],
  cancelled: [],
} as const;

function Feedback({ state }: { state: AdminOrderActionState }) {
  if (!state) return null;
  return <p aria-live="polite" className={`mt-3 text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{state.message}</p>;
}

export function AdminOrderOperations({ orderId, fulfilmentStatus }: { orderId: string; fulfilmentStatus: keyof typeof transitions }) {
  const [state, action, pending] = useActionState(updateAdminFulfilmentStatusAction, null);
  const available = transitions[fulfilmentStatus];
  if (!available.length) return <p className="text-sm text-neutral-500">No further fulfilment actions are available.</p>;
  return <div className="space-y-3">
    {available.map((transition) => <form action={action} key={transition.value} onSubmit={(event) => {
      if (transition.value === "cancelled" && !window.confirm("Cancel this order? This cannot be reversed from the operations panel.")) event.preventDefault();
    }}>
      <input name="orderId" type="hidden" value={orderId} />
      <input name="nextStatus" type="hidden" value={transition.value} />
      <input name="confirmation" type="hidden" value="UPDATE FULFILMENT" />
      <button className={`min-h-11 rounded-xl px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 ${transition.value === "cancelled" ? "border border-red-200 text-red-700" : "bg-neutral-950 text-white"}`} disabled={pending} type="submit">{pending ? "Updating…" : transition.label}</button>
    </form>)}
    <Feedback state={state} />
  </div>;
}

export function AdminOrderNotes({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(addAdminOrderNoteAction, null);
  return <form action={action} className="mt-4 space-y-3">
    <input name="orderId" type="hidden" value={orderId} />
    <label className="block text-sm font-medium" htmlFor="internal-note">Add an internal note</label>
    <textarea className="min-h-24 w-full rounded-xl border border-black/10 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" id="internal-note" maxLength={2000} name="body" required />
    <button className="min-h-11 rounded-xl border border-black/10 px-4 text-sm font-semibold disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving…" : "Save internal note"}</button>
    <Feedback state={state} />
  </form>;
}
