import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/AppShell";
import { PetForm } from "@/features/pets/components/PetForm";
import { createPetService } from "@/features/pets/services/pet-service";

export const metadata: Metadata = {
  title: "Edit pet",
  robots: { index: false, follow: false },
};

export default async function EditPetPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const pet = await createPetService().getPet(petId);
  if (!pet) notFound();

  return <section className="mx-auto max-w-2xl"><PageHeader eyebrow="My pets" title={`Edit ${pet.name}`} description="Keep the core details for your pet accurate." /><div className="mt-10 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8"><PetForm pet={pet} /></div></section>;
}
