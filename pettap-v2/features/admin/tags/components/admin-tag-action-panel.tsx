"use client";

import { useActionState } from "react";

import { reactivateAdminTagAction, suspendAdminTagAction, type AdminTagActionState } from "../actions/admin-tag-actions";

const reasonOptions = ["reported_compromised", "reported_stolen", "fraud_suspected", "ownership_dispute", "security_incident", "manual_review", "other"];

function TagActionForm({ tagId, action, confirmation, title, submitLabel }: { tagId: string; action: typeof suspendAdminTagAction | typeof reactivateAdminTagAction; confirmation: "SUSPEND" | "REACTIVATE"; title: string; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, null as AdminTagActionState);
  return <form action={formAction} className="rounded-2xl border border-black/[0.08] bg-white p-5"><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-neutral-600">This action is recorded and requires an explicit confirmation.</p><input name="tagId" type="hidden" value={tagId} /><label className="mt-4 block text-sm font-medium" htmlFor={`${confirmation}-reason-code`}>Reason</label><select className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950" defaultValue="manual_review" disabled={pending} id={`${confirmation}-reason-code`} name="reasonCode">{reasonOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select><label className="mt-4 block text-sm font-medium" htmlFor={`${confirmation}-reason`}>Short note <span className="font-normal text-neutral-500">(required for Other)</span></label><textarea className="mt-2 min-h-20 w-full rounded-xl border border-black/[0.1] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950" disabled={pending} id={`${confirmation}-reason`} maxLength={500} name="reason" /><label className="mt-4 block text-sm font-medium" htmlFor={`${confirmation}-confirm`}>Type {confirmation} to confirm</label><input className="mt-2 min-h-11 w-full rounded-xl border border-black/[0.1] px-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-neutral-950" disabled={pending} id={`${confirmation}-confirm`} name="confirmation" required /><button className="mt-5 min-h-11 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 disabled:opacity-60" disabled={pending} type="submit">{pending ? "Processing…" : submitLabel}</button>{state ? <p className={state.status === "error" ? "mt-3 text-sm text-red-700" : "mt-3 text-sm text-emerald-700"} role="status">{state.message}</p> : null}</form>;
}

export function AdminTagActionPanel({ tagId, status, canSuspend, canReactivate }: { tagId: string; status: string; canSuspend: boolean; canReactivate: boolean }) {
  if (status === "suspended" && canReactivate) return <TagActionForm tagId={tagId} action={reactivateAdminTagAction} confirmation="REACTIVATE" title="Reactivate tag" submitLabel="Reactivate tag" />;
  if (status !== "retired" && canSuspend) return <TagActionForm tagId={tagId} action={suspendAdminTagAction} confirmation="SUSPEND" title="Suspend tag" submitLabel="Suspend tag" />;
  return null;
}
