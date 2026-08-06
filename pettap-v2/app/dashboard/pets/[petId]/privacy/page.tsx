import { notFound } from "next/navigation";

import { PetPublicPreferencesForm } from "@/features/pets/components/PetPublicPreferencesForm";
import { PetPublicPreferencesService } from "@/features/pets/services/pet-public-preferences-service";

export default async function PetPrivacyPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const preferences = await new PetPublicPreferencesService().get(petId);
  if (!preferences) notFound();
  return <section className="mx-auto max-w-3xl"><PetPublicPreferencesForm preferences={preferences} /></section>;
}
