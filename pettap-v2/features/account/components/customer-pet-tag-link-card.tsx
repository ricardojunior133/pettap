"use client";

import { useState, useTransition } from "react";

import { linkCustomerPetTag } from "../actions/customer-pet-tag-actions";
import type { CustomerPetTagLinkView } from "../services/customer-pet-tag-link-service";

const inputClassName = "mt-1 min-h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/15";
const messages = {
  PET_NOT_FOUND: "We couldn't find this pet.",
  PET_ALREADY_LINKED: "This pet already has an NFC tag linked.",
  TAG_UNAVAILABLE: "This NFC tag is unavailable for linking.",
} as const;

export function CustomerPetTagLinkCard({ petPublicIdentifier, link }: { petPublicIdentifier: string; link: CustomerPetTagLinkView | null }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [currentLink, setCurrentLink] = useState(link);

  if (currentLink) return <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-950"><p className="font-semibold">Tag linked</p><dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-emerald-800">Tag ID</dt><dd className="mt-0.5 font-medium">{currentLink.publicCode}</dd></div><div><dt className="text-emerald-800">Linked</dt><dd className="mt-0.5 font-medium">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(currentLink.linkedAt))}</dd></div></dl></div>;

  return <div><p className="text-sm text-neutral-600">No NFC tag linked</p><form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); setMessage(null); start(async () => { try { const result = await linkCustomerPetTag(petPublicIdentifier, form); if (result.ok) setCurrentLink(result.link); else setMessage(messages[result.code]); } catch { setMessage("We couldn't link that NFC tag. Please check the details and try again."); } }); }}><label className="text-sm font-medium">Tag ID<input className={inputClassName} name="publicCode" required autoComplete="off" spellCheck={false}/></label><p className="text-sm text-neutral-600">Only an unlinked tag already assigned to your account can be linked here.</p>{message ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{message}</p> : null}<button disabled={pending} className="min-h-11 w-fit rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Linking…" : "Link NFC Tag"}</button></form></div>;
}
