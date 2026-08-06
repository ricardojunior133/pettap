"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createPetAction, updatePetAction, type PetActionState } from "../actions/pet-actions";
import { petSpecies, type Pet } from "../types/pet";

type PetFormProps = {
  pet?: Pick<Pet, "id" | "name" | "species">;
};

const initialState: PetActionState = null;

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="mt-1.5 text-sm text-red-700" role="alert">{errors[0]}</p>;
}

export function PetForm({ pet }: PetFormProps) {
  const isEditing = Boolean(pet);
  const action = pet ? updatePetAction.bind(null, pet.id) : createPetAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-6" noValidate>
      <div>
        <label className="text-sm font-medium text-neutral-900" htmlFor="name">Pet name</label>
        <input
          autoComplete="off"
          className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:bg-neutral-50"
          defaultValue={pet?.name}
          disabled={pending}
          id="name"
          maxLength={60}
          name="name"
          required
        />
        <FieldError errors={state?.fieldErrors?.name} />
      </div>

      <div>
        <label className="text-sm font-medium text-neutral-900" htmlFor="species">Species</label>
        <select
          className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:bg-neutral-50"
          defaultValue={pet?.species ?? ""}
          disabled={pending}
          id="species"
          name="species"
          required
        >
          <option disabled value="">Choose a species</option>
          {petSpecies.map((species) => <option key={species} value={species}>{species[0].toUpperCase() + species.slice(1)}</option>)}
        </select>
        <FieldError errors={state?.fieldErrors?.species} />
      </div>

      {state ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">{state.message}</p> : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link className="flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10" href={pet ? `/dashboard/pets/${pet.id}` : "/dashboard/pets"}>Cancel</Link>
        <button className="flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">{pending ? "Saving…" : isEditing ? "Save changes" : "Add pet"}</button>
      </div>
    </form>
  );
}
