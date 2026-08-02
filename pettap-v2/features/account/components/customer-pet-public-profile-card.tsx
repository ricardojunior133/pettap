"use client";

import { useState, useTransition } from "react";

import { saveCustomerPetPublicProfile } from "../actions/customer-pet-public-profile-actions";
import type { CustomerPetPublicProfileView } from "../services/customer-pet-public-profile-service";

export function CustomerPetPublicProfileCard({ petPublicIdentifier, profile }: { petPublicIdentifier: string; profile: CustomerPetPublicProfileView }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return <form action={(formData) => startTransition(async () => {
    const result = await saveCustomerPetPublicProfile(petPublicIdentifier, formData);
    setMessage(result.ok ? "Your public profile preferences have been saved." : "We couldn't save your public profile preferences.");
  })} className="mt-4 space-y-5">
    <label className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950"><input className="mt-1" defaultChecked={profile.enabled} name="enabled" type="checkbox" /><span><strong className="block">Enable public profile</strong>It is available only through your tag’s Public Code after the tag is active.</span></label>
    <fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2"><legend className="mb-2 text-sm font-semibold">Choose what is public</legend>
      <label className="flex items-center gap-2 text-sm"><input defaultChecked={profile.showPhoto} name="showPhoto" type="checkbox" />Photo</label>
      <label className="flex items-center gap-2 text-sm"><input defaultChecked={profile.showName} name="showName" type="checkbox" />Pet name</label>
      <label className="flex items-center gap-2 text-sm"><input defaultChecked={profile.showBreed} name="showBreed" type="checkbox" />Species and breed</label>
      <label className="flex items-center gap-2 text-sm"><input defaultChecked={profile.showAge} name="showAge" type="checkbox" />Age</label>
    </fieldset>
    <label className="block text-sm font-medium">Public message<textarea className="mt-2 min-h-24 w-full rounded-xl border border-neutral-300 p-3" defaultValue={profile.publicMessage ?? ""} maxLength={280} name="publicMessage" placeholder="A short message for anyone who taps your PetTap." /></label>
    <p className="text-sm text-neutral-600">Your phone number and email stay private. When Lost Mode is on, people can contact you only through PetTap’s secure message form.</p>
    {profile.updatedAt ? <p className="text-xs text-neutral-500">Last updated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(profile.updatedAt))}</p> : null}
    <button className="min-h-11 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "Saving…" : "Save public profile"}</button>
    <p aria-live="polite" className="min-h-5 text-sm text-neutral-700">{message}</p>
  </form>;
}
