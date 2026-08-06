import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MedicalService } from "@/features/medical/services/medical-service";
import { createPetService } from "@/features/pets/services/pet-service";
import { VaccinationList } from "@/features/vaccinations/components/VaccinationList";
import { VaccinationService } from "@/features/vaccinations/services/vaccination-service";

export const metadata: Metadata = { title: "Medical profile", robots: { index: false, follow: false } };

export default async function MedicalPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const pet = await createPetService().getPet(petId);
  if (!pet) notFound();

  const [medical, vaccinations] = await Promise.all([
      new MedicalService().getMedicalInformation(pet.id),
      new VaccinationService().listVaccinations(pet.id),
    ]);
    const entries = medical ? [medical.conditions, medical.medications, medical.allergies, medical.careInstructions].filter(Boolean).length : 0;

  return <section className="mx-auto max-w-3xl"><div className="flex flex-col gap-5 border-b border-black/[0.07] pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{pet.name}</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-neutral-950">Medical Profile</h1><p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">Private information that helps you keep essential care details together.</p></div><Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20" href={`/dashboard/pets/${pet.id}/medical/edit`}>{medical ? "Edit profile" : "Create profile"}</Link></div><section className="mt-8 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold tracking-[-0.03em] text-neutral-950">Care summary</h2><p className="mt-1 text-sm leading-6 text-neutral-600">{medical ? `${entries} of 4 sections completed` : "No medical information recorded yet."}</p></div>{medical ? <p className="text-sm text-neutral-500">Updated {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(medical.updatedAt))}</p> : null}</div>{medical ? <dl className="mt-7 grid gap-6 sm:grid-cols-2">{[{ label: "Medical conditions", value: medical.conditions }, { label: "Medication", value: medical.medications }, { label: "Allergies", value: medical.allergies }, { label: "Special care instructions", value: medical.careInstructions }].map((item) => <div key={item.label}><dt className="text-sm text-neutral-500">{item.label}</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-950">{item.value || "Not recorded"}</dd></div>)}</dl> : <p className="mt-6 rounded-2xl bg-neutral-50 p-5 text-sm leading-6 text-neutral-600">Add care details when you&apos;re ready. They stay private until future visibility controls are introduced.</p>}</section><section className="mt-10"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">Vaccinations</h2><p className="mt-2 text-sm leading-6 text-neutral-600">Keep an organised history of important vaccinations.</p></div><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.1] px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10" href={`/dashboard/pets/${pet.id}/vaccinations/new`}>Add vaccination</Link></div><VaccinationList petId={pet.id} vaccinations={vaccinations} /></section></section>;
}
