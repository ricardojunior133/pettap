import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PetWorkspace from "@/components/dashboard/workspace/PetWorkspace";
import { getPetWorkspaceById, getPetWorkspaceIds } from "@/features/pet";

export const metadata: Metadata = { title: "Pet workspace", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return getPetWorkspaceIds().map((petId) => ({ petId }));
}

export default async function PetWorkspacePage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const pet = getPetWorkspaceById(petId);
  if (!pet) notFound();
  return <PetWorkspace pet={pet} />;
}
