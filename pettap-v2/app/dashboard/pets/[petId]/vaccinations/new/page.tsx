import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { createPetService } from "@/features/pets/services/pet-service";
import { VaccinationForm } from "@/features/vaccinations/components/VaccinationForm";

export const metadata: Metadata = { title: "Add vaccination", robots: { index: false, follow: false } };

export default async function NewVaccinationPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const pet = await createPetService().getPet(petId);
  if (!pet) notFound();
  return <section className="mx-auto max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{pet.name}</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-neutral-950">Add vaccination</h1><p className="mt-3 text-sm leading-6 text-neutral-600">Record a vaccination and, optionally, when it expires.</p><div className="mt-10 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8"><VaccinationForm petId={pet.id} /></div></section>;
}
