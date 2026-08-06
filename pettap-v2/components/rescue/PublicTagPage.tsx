import Image from "next/image";

import type { PublicTagResolution } from "@/features/public-tags/types";

export function PublicTagPage({ resolution }: { resolution: PublicTagResolution }) {
  if (resolution.kind === "suspended") return <State title="This PetTap tag has been suspended." detail={`Please contact PetTap Support. Reference: ${resolution.reference}`} />;
  if (resolution.kind === "orphan") return <State title="This PetTap tag is not linked to a pet." detail={`Please contact PetTap Support. Reference: ${resolution.reference}`} />;
  if (resolution.kind === "unknown") return <State title="Unknown Tag" detail="This tag is not registered or does not have a public rescue profile." />;
  if (resolution.kind === "rate_limited") return <State title="Too many requests." detail="Please wait a moment and try again." />;

  const hasSharedDetails = resolution.pet.name || resolution.pet.photoUrl || resolution.medical || resolution.primaryContact || resolution.emergencyContacts?.length;
  return <main className="min-h-screen bg-neutral-50 p-4 sm:p-8"><article className="mx-auto max-w-xl rounded-[32px] bg-white p-6 shadow-sm sm:p-10"><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">PetTap rescue</p><div className="mt-6 flex items-center gap-5">{resolution.pet.photoUrl ? <Image alt={resolution.pet.name ? `Photo of ${resolution.pet.name}` : "Pet photo"} className="size-24 rounded-3xl object-cover" height={96} src={resolution.pet.photoUrl} unoptimized width={96} /> : null}<div><h1 className="text-4xl font-semibold tracking-tight">{resolution.pet.name ?? "PetTap rescue profile"}</h1><p className="mt-2 text-sm font-semibold capitalize text-emerald-700">{resolution.status === "lost" ? "Lost Mode active" : "Safe profile"}</p></div></div>
    {resolution.primaryContact ? <Contact title="Primary contact" contact={resolution.primaryContact} /> : null}
    {resolution.emergencyContacts?.length ? <section className="mt-6 rounded-2xl bg-neutral-50 p-5"><h2 className="font-semibold">Emergency contacts</h2><ul className="mt-3 space-y-2 text-sm text-neutral-700">{resolution.emergencyContacts.map((contact) => <li key={`${contact.name}-${contact.phone}`}>{contact.name}: <a className="font-medium underline" href={`tel:${contact.phone}`}>{contact.phone}</a></li>)}</ul></section> : null}
    {resolution.medical ? <section className="mt-6 rounded-2xl bg-neutral-50 p-5"><h2 className="font-semibold">Important care information</h2><dl className="mt-3 space-y-3 text-sm text-neutral-700">{resolution.medical.conditions ? <div><dt className="font-medium text-neutral-950">Medical conditions</dt><dd>{resolution.medical.conditions}</dd></div> : null}{resolution.medical.medications ? <div><dt className="font-medium text-neutral-950">Medications</dt><dd>{resolution.medical.medications}</dd></div> : null}{resolution.medical.specialInstructions ? <div><dt className="font-medium text-neutral-950">Special instructions</dt><dd>{resolution.medical.specialInstructions}</dd></div> : null}</dl></section> : null}
    {!hasSharedDetails ? <section className="mt-10 rounded-2xl bg-neutral-50 p-5"><h2 className="font-semibold">Need to help?</h2><p className="mt-2 text-sm leading-6 text-neutral-600">This owner has not chosen to share details publicly. Please keep the pet safe and contact PetTap Support with the tag reference.</p></section> : null}
  </article></main>;
}

function Contact({ title, contact }: { title: string; contact: { name: string; phone: string } }) {
  return <section className="mt-8 rounded-2xl bg-neutral-950 p-5 text-white"><p className="text-sm text-white/70">{title}</p><h2 className="mt-1 text-xl font-semibold">{contact.name}</h2><a className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-neutral-950" href={`tel:${contact.phone}`}>Call {contact.name}</a></section>;
}

function State({ title, detail }: { title: string; detail: string }) { return <main className="grid min-h-screen place-items-center bg-neutral-50 p-6"><section className="max-w-md rounded-[32px] bg-white p-8 text-center shadow-sm"><p className="text-xs font-semibold uppercase tracking-[.18em] text-neutral-500">PetTap</p><h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-4 leading-7 text-neutral-600">{detail}</p></section></main>; }
