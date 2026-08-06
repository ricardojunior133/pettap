import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createPetService } from "@/features/pets/services/pet-service";
import { VaccinationList } from "@/features/vaccinations/components/VaccinationList";
import { VaccinationService } from "@/features/vaccinations/services/vaccination-service";

export const metadata: Metadata = { title: "Vaccinations", robots: { index: false, follow: false } };

export default async function VaccinationsPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const pet = await createPetService().getPet(petId);
  if (!pet) notFound();

  const vaccinations = await new VaccinationService().listVaccinations(pet.id);
  return <section className="mx-auto max-w-3xl"><div className="flex flex-col gap-5 border-b border-black/[0.07] pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{pet.name}</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-neutral-950">Vaccinations</h1><p className="mt-3 text-sm leading-6 text-neutral-600">A private, organised record of your pet&apos;s vaccinations.</p></div><Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20" href={`/dashboard/pets/${pet.id}/vaccinations/new`}>Add vaccination</Link></div><VaccinationList petId={pet.id} vaccinations={vaccinations} /></section>;
}
