import type { Metadata } from "next";

import { PageHeader } from "@/components/app/AppShell";
import { PetForm } from "@/features/pets/components/PetForm";

export const metadata: Metadata = {
  title: "Add a pet",
  description: "Create a private PetTap profile for your pet.",
  robots: { index: false, follow: false },
};

export default function NewPetPage() {
  return <section className="mx-auto max-w-2xl"><PageHeader eyebrow="My pets" title="Add a pet" description="Start with a few simple details. You can complete the rest later." /><div className="mt-10 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8"><PetForm /></div></section>;
}
