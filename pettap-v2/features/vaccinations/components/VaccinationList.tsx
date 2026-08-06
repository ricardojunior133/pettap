"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";

import { deleteVaccinationAction, type VaccinationActionState } from "../actions/vaccination-actions";
import type { Vaccination } from "../types/vaccination";

const initialState: VaccinationActionState = null;

function DeleteVaccinationButton({ petId, vaccination }: { petId: string; vaccination: Vaccination }) {
  const action = deleteVaccinationAction.bind(null, petId, vaccination.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} onSubmit={(event) => { if (!window.confirm(`Delete ${vaccination.name}?`)) event.preventDefault(); }}><button className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-700/15 disabled:opacity-60" disabled={pending} type="submit"><Trash2 className="size-4" aria-hidden="true" />{pending ? "Deleting…" : "Delete"}</button>{state ? <p className="mt-1 max-w-48 text-xs leading-5 text-red-700" role="alert">{state.message}</p> : null}</form>;
}

export function VaccinationList({ petId, vaccinations }: { petId: string; vaccinations: Vaccination[] }) {
  if (vaccinations.length === 0) return <section className="mt-6 rounded-[28px] border border-dashed border-black/[0.12] bg-white p-8 text-center"><CalendarDays className="mx-auto size-6 text-neutral-400" aria-hidden="true" /><h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">No vaccinations recorded</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">Add the vaccinations that are important for your pet&apos;s care.</p></section>;

  const today = new Date().toISOString().slice(0, 10);
  return <section className="mt-6 space-y-3" aria-label="Vaccinations">{vaccinations.map((vaccination) => { const expired = Boolean(vaccination.expiresAt && vaccination.expiresAt < today); return <article className="rounded-2xl border border-black/[0.07] bg-white p-5" key={vaccination.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold tracking-[-0.02em] text-neutral-950">{vaccination.name}</h2><p className="mt-1 text-sm text-neutral-600">Given {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(`${vaccination.administeredAt}T12:00:00Z`))}</p>{vaccination.expiresAt ? <p className={expired ? "mt-1 text-sm font-medium text-amber-800" : "mt-1 text-sm text-neutral-600"}>{expired ? "Expired " : "Expires "}{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(`${vaccination.expiresAt}T12:00:00Z`))}</p> : null}</div><div className="flex flex-wrap gap-2"><Link className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10" href={`/dashboard/pets/${petId}/vaccinations/${vaccination.id}/edit`}><Pencil className="size-4" aria-hidden="true" />Edit</Link><DeleteVaccinationButton petId={petId} vaccination={vaccination} /></div></div></article>; })}</section>;
}
