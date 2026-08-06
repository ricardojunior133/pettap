import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/app/AppShell";
import { PetList } from "@/features/pets/components/PetList";
import { createPetService } from "@/features/pets/services/pet-service";

export const metadata: Metadata = {
  title: "My pets",
  description: "Manage the pets connected to your PetTap account.",
  robots: { index: false, follow: false },
};

export default async function PetsPage() {
  const pets = await createPetService().listPets();

  return <><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><PageHeader title="My Pets" description="Each profile is a private starting point for keeping your companion safe." /><Link className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20" href="/dashboard/pets/new">Add a pet</Link></div><PetList pets={pets} /></>;
}
