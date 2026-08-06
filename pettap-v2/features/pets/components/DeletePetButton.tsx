"use client";

import { useActionState } from "react";

import { deletePetAction, type PetActionState } from "../actions/pet-actions";

const initialState: PetActionState = null;

export function DeletePetButton({ petId, petName }: { petId: string; petName: string }) {
  const action = deletePetAction.bind(null, petId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return <form action={formAction} onSubmit={(event) => { if (!window.confirm(`Delete ${petName}? This can’t be undone.`)) event.preventDefault(); }}><button className="min-h-11 rounded-xl px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-700/15 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">{pending ? "Deleting…" : "Delete pet"}</button>{state ? <p className="mt-2 max-w-xs text-sm leading-5 text-red-700" role="alert">{state.message}</p> : null}</form>;
}
