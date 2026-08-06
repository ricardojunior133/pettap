"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createMedicalAction,
  type MedicalActionState,
  updateMedicalAction,
} from "../actions/medical-actions";
import type { MedicalInformation } from "../types/medical";

const initialState: MedicalActionState = null;

const fields = [
  {
    key: "conditions",
    label: "Medical conditions",
    hint: "For example, ongoing conditions or important diagnoses.",
    rows: 3,
  },
  {
    key: "medications",
    label: "Medication",
    hint: "Include medication currently needed.",
    rows: 3,
  },
  {
    key: "allergies",
    label: "Allergies",
    hint: "Include known food, medicine or environmental allergies.",
    rows: 3,
  },
  {
    key: "careInstructions",
    label: "Special care instructions",
    hint: "Share information that could help in an emergency.",
    rows: 4,
  },
] as const;

export function MedicalForm({
  petId,
  medical,
}: {
  petId: string;
  medical: MedicalInformation | null;
}) {
  const action = (medical ? updateMedicalAction : createMedicalAction).bind(
    null,
    petId,
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-6" noValidate>
      {fields.map((field) => {
        const error = state?.fieldErrors?.[field.key]?.[0];
        const errorId = `${field.key}-error`;

        return (
          <div key={field.key}>
            <label className="text-sm font-medium text-neutral-900" htmlFor={field.key}>
              {field.label}
            </label>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              {field.hint}
            </p>
            <textarea
              aria-describedby={error ? errorId : undefined}
              aria-invalid={Boolean(error)}
              className="mt-2 min-h-28 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:bg-neutral-50"
              defaultValue={medical?.[field.key] ?? ""}
              disabled={pending}
              id={field.key}
              maxLength={field.key === "careInstructions" ? 1500 : 1000}
              name={field.key}
              rows={field.rows}
            />
            {error ? (
              <p className="mt-1.5 text-sm text-red-700" id={errorId} role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      {state ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          className="flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10"
          href={`/dashboard/pets/${petId}/medical`}
        >
          Cancel
        </Link>
        <button
          className="flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving…" : "Save medical profile"}
        </button>
      </div>
    </form>
  );
}
