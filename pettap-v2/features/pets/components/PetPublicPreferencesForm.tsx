"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initialPetPublicPreferencesActionState, updatePetPublicPreferences } from "../actions/pet-public-preferences-actions";
import type { PetPublicPreferencesViewModel } from "../schemas/pet-public-preferences";

const groups = [
  { title: "Identity", fields: [["showPhoto", "Photo"], ["showName", "Pet name"], ["showBreed", "Breed"], ["showAge", "Age"]] },
  { title: "Health", fields: [["showMedicalConditions", "Medical conditions"], ["showMedications", "Medications"], ["showSpecialInstructions", "Special instructions"]] },
  { title: "Contacts", fields: [["showPrimaryContact", "Primary contact"], ["showEmergencyContacts", "Emergency contacts"]] },
] as const;

export function PetPublicPreferencesForm({ preferences }: { preferences: PetPublicPreferencesViewModel }) {
  const [state, formAction, pending] = useActionState(updatePetPublicPreferences, initialPetPublicPreferencesActionState);
  const disabled = pending || !preferences.available;

  return <section className="mt-8 rounded-[28px] border border-black/[.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8">
    <div className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100"><ShieldCheck className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-neutral-500">Public rescue page</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-neutral-950">Choose what finders can see</h2><p className="mt-2 text-sm leading-6 text-neutral-600">Your choices apply whenever someone taps this PetTap. The global switch below always takes priority.</p></div></div>
    {!preferences.available ? <p role="status" className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">These controls are ready, but require the scheduled privacy database migration before they can be saved. Nothing is public until then.</p> : null}
    <form action={formAction} className="mt-7 space-y-6">
      <input type="hidden" name="petId" value={preferences.petId} />
      <label className="flex gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
        <input name="publicProfileEnabled" type="checkbox" defaultChecked={preferences.publicProfileEnabled} disabled={disabled} className="mt-0.5 size-4 rounded border-neutral-300" />
        <span><span className="font-semibold text-neutral-950">Allow this pet&apos;s public rescue profile</span><br />When off, no information below is shared — even if a detail is selected.</span>
      </label>
      {groups.map((group) => <fieldset key={group.title} disabled={disabled} className="rounded-2xl border border-neutral-200 p-4"><legend className="px-1 text-sm font-semibold text-neutral-950">{group.title}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{group.fields.map(([field, label]) => <label key={field} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-50"><input name={field} type="checkbox" defaultChecked={preferences[field]} className="size-4 rounded border-neutral-300" />{label}</label>)}</div></fieldset>)}
      {state.status === "success" ? <p role="status" aria-live="polite" className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"><Check className="size-4" />{state.message}</p> : null}
      {state.status === "error" ? <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-800">{state.message}</p> : null}
      <div className="flex justify-end border-t border-neutral-100 pt-5"><Button type="submit" disabled={disabled}>{pending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}{pending ? "Saving…" : "Save sharing preferences"}</Button></div>
    </form>
  </section>;
}
