"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createVaccinationAction, updateVaccinationAction, type VaccinationActionState } from "../actions/vaccination-actions";
import type { Vaccination } from "../types/vaccination";

const initialState: VaccinationActionState = null;

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="mt-1.5 text-sm text-red-700" role="alert">{errors[0]}</p> : null;
}

export function VaccinationForm({ petId, vaccination }: { petId: string; vaccination?: Vaccination }) {
  const action = vaccination ? updateVaccinationAction.bind(null, petId, vaccination.id) : createVaccinationAction.bind(null, petId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return <form action={formAction} className="mt-8 space-y-6" noValidate><div><label className="text-sm font-medium text-neutral-900" htmlFor="name">Vaccination name</label><input className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:bg-neutral-50" defaultValue={vaccination?.name} disabled={pending} id="name" maxLength={120} name="name" required /><FieldError errors={state?.fieldErrors?.name} /></div><div><label className="text-sm font-medium text-neutral-900" htmlFor="administeredAt">Date administered</label><input className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:bg-neutral-50" defaultValue={vaccination?.administeredAt} disabled={pending} id="administeredAt" name="administeredAt" required type="date" /><FieldError errors={state?.fieldErrors?.administeredAt} /></div><div><label className="text-sm font-medium text-neutral-900" htmlFor="expiresAt">Expiry date <span className="font-normal text-neutral-500">(optional)</span></label><input className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:bg-neutral-50" defaultValue={vaccination?.expiresAt ?? ""} disabled={pending} id="expiresAt" name="expiresAt" type="date" /><FieldError errors={state?.fieldErrors?.expiresAt} /></div>{state ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">{state.message}</p> : null}<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Link className="flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10" href={`/dashboard/pets/${petId}/vaccinations`}>Cancel</Link><button className="flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">{pending ? "Saving…" : vaccination ? "Save changes" : "Add vaccination"}</button></div></form>;
}
