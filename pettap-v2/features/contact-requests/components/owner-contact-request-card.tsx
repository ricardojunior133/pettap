"use client";

import { useActionState } from "react";

import type { OwnerContactRequestDto } from "../services/contact-request-inbox-service";

type ActionState = { ok: boolean; message: string };
type BoundAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

const statusCopy: Record<OwnerContactRequestDto["status"], string> = {
  pending: "Pending",
  delivered: "Delivered",
  closed: "Closed",
  expired: "Expired",
  cancelled: "Cancelled",
};

function RequestAction({ label, action }: { label: string; action: BoundAction }) {
  const [state, formAction, pending] = useActionState(action, { ok: false, message: "" });
  return <form action={formAction}><button type="submit" disabled={pending} className="min-h-10 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-950 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Updating…" : label}</button>{state.message ? <p className={state.ok ? "sr-only" : "mt-2 text-sm text-red-700"} role={state.ok ? "status" : "alert"} aria-live="polite">{state.message}</p> : null}</form>;
}

export function OwnerContactRequestCard({ request, markDeliveredAction, closeAction, expireAction }: {
  request: OwnerContactRequestDto;
  markDeliveredAction: BoundAction;
  closeAction: BoundAction;
  expireAction: BoundAction;
}) {
  const terminal = request.status === "closed" || request.status === "expired" || request.status === "cancelled";
  return <article className="rounded-3xl border border-black/[0.08] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-medium text-neutral-500">{request.petDisplayName ? `About ${request.petDisplayName}` : "Finder contact request"}</p><h2 className="mt-1 text-lg font-semibold">{request.finderName ?? "A finder"}</h2></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">{statusCopy[request.status]}</span></div>
    <dl className="mt-5 space-y-3 text-sm leading-6"><div><dt className="font-medium text-neutral-500">Contact</dt><dd className="break-words text-neutral-900">{request.finderContact ?? "Not provided"}</dd></div><div><dt className="font-medium text-neutral-500">Message</dt><dd className="whitespace-pre-wrap break-words text-neutral-900">{request.message ?? "No message provided."}</dd></div></dl>
    <p className="mt-5 text-xs text-neutral-500">Received {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.createdAt))}</p>
    {!terminal ? <div className="mt-5 flex flex-wrap gap-2">{request.status === "pending" ? <RequestAction label="Mark delivered" action={markDeliveredAction} /> : null}<RequestAction label="Close request" action={closeAction} /><RequestAction label="Expire request" action={expireAction} /></div> : null}
  </article>;
}
