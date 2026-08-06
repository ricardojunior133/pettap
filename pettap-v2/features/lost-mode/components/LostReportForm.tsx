"use client";

import { useActionState } from "react";

import {
  createLostReportAction,
  type LostReportActionState,
} from "../actions/lost-report-actions";

const initialState: LostReportActionState = null;

export function LostReportForm({ petId }: { petId: string }) {
  const [state, action, pending] = useActionState(
    createLostReportAction.bind(null, petId),
    initialState,
  );
  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <div>
        <label className="text-sm font-medium" htmlFor="lastSeenAt">
          When was your pet last seen?{" "}
          <span className="text-neutral-500">(optional)</span>
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
          id="lastSeenAt"
          name="lastSeenAt"
          type="datetime-local"
        />
        {fieldErrors?.lastSeenAt?.[0] ? (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.lastSeenAt[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="lastSeenLocation">
          Last known area <span className="text-neutral-500">(optional)</span>
        </label>
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
          id="lastSeenLocation"
          maxLength={160}
          name="lastSeenLocation"
        />
        {fieldErrors?.lastSeenLocation?.[0] ? (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.lastSeenLocation[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="publicMessage">
          Public message <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          className="mt-2 min-h-28 w-full rounded-xl border border-black/10 p-4 outline-none focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
          id="publicMessage"
          maxLength={600}
          name="publicMessage"
        />
        {fieldErrors?.publicMessage?.[0] ? (
          <p className="mt-1.5 text-sm text-red-700" role="alert">
            {fieldErrors.publicMessage[0]}
          </p>
        ) : null}
      </div>
      {state?.status === "error" ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        className="min-h-12 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating…" : "Mark as lost"}
      </button>
    </form>
  );
}
