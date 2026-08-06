"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  resolveLostReportAction,
  type LostReportActionState,
} from "../actions/lost-report-actions";

const initialState: LostReportActionState = null;

export function LostModeResolveForm({
  petId,
  petName,
  lostReportId,
}: {
  petId: string;
  petName: string;
  lostReportId: string;
}) {
  const [state, formAction, pending] = useActionState(
    resolveLostReportAction.bind(null, petId, lostReportId),
    initialState,
  );
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const resolved = state?.status === "success";

  useEffect(() => {
    if (state) feedbackRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="mt-6">
      {state ? (
        <p
          ref={feedbackRef}
          aria-live="polite"
          className={
            state.status === "success"
              ? "mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"
              : "mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
          }
          role={state.status === "error" ? "alert" : "status"}
          tabIndex={-1}
        >
          {state.message}
        </p>
      ) : null}
      <button
        className="min-h-12 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending || resolved}
        type="submit"
      >
        {pending
          ? "Marking as safely home…"
          : resolved
            ? "Lost Mode turned off"
            : `Mark ${petName} as safely home`}
      </button>
    </form>
  );
}
