import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PawPrint } from "lucide-react";

import { DeletePetButton } from "@/features/pets/components/DeletePetButton";
import { createPetService } from "@/features/pets/services/pet-service";
import { MedicalNotFoundError, MedicalService } from "@/features/medical/services/medical-service";
import { PetGallery } from "@/features/photos/components/PetGallery";
import { PhotoNotFoundError, PhotoService } from "@/features/photos/services/photo-service";
import type { PetPhoto } from "@/features/photos/types/photo";
import { VaccinationNotFoundError, VaccinationService } from "@/features/vaccinations/services/vaccination-service";
import { EmergencyContactNotFoundError, EmergencyContactService } from "@/features/emergency-contacts/services/emergency-contact-service";

export const metadata: Metadata = {
  title: "Pet details",
  robots: { index: false, follow: false },
};

const futureAreas = ["NFC Tag"];

export default async function PetDetailsPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const pet = await createPetService().getPet(petId);
  if (!pet) notFound();

  let photos: PetPhoto[] = [];
  let medical = null;
  let vaccinationCount = 0;
  let emergencyContactCount = 0;
  try {
    const [loadedPhotos, loadedMedical, vaccinations, contacts] = await Promise.all([
      new PhotoService().listPhotos(pet.id),
      new MedicalService().getMedicalInformation(pet.id),
      new VaccinationService().listVaccinations(pet.id),
      new EmergencyContactService().list(pet.id),
    ]);
    photos = loadedPhotos;
    medical = loadedMedical;
    vaccinationCount = vaccinations.length;
    emergencyContactCount = contacts.length;
  } catch (error) {
    if (error instanceof PhotoNotFoundError || error instanceof MedicalNotFoundError || error instanceof VaccinationNotFoundError || error instanceof EmergencyContactNotFoundError) notFound();
    throw error;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-6 border-b border-black/[0.07] pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
            <PawPrint className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{pet.species}</p>
            <h1 className="mt-1 truncate text-4xl font-semibold tracking-[-0.05em] text-neutral-950">{pet.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20" href={`/dashboard/pets/${pet.id}/edit`}>Edit pet</Link>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[.1] px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100" href={`/dashboard/pets/${pet.id}/lost`}>Lost Mode</Link>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[.1] px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100" href={`/dashboard/pets/${pet.id}/privacy`}>Public privacy</Link>
          <DeletePetButton petId={pet.id} petName={pet.name} />
        </div>
      </div>

      <section className="mt-8 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-neutral-950">Profile details</h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div><dt className="text-sm text-neutral-500">Name</dt><dd className="mt-1 font-medium text-neutral-950">{pet.name}</dd></div>
          <div><dt className="text-sm text-neutral-500">Species</dt><dd className="mt-1 font-medium capitalize text-neutral-950">{pet.species}</dd></div>
          <div><dt className="text-sm text-neutral-500">Profile created</dt><dd className="mt-1 font-medium text-neutral-950">{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(pet.createdAt))}</dd></div>
        </dl>
      </section>

      <section className="mt-8 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Safety</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">Emergency contacts</h2><p className="mt-2 text-sm text-neutral-600">{emergencyContactCount ? `${emergencyContactCount} private contact${emergencyContactCount === 1 ? "" : "s"} configured.` : "Add a trusted contact so help is never far away."}</p></div><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.1] px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100" href={`/dashboard/pets/${pet.id}/contacts`}>Manage emergency contacts</Link></div>
      </section>

      <PetGallery petId={pet.id} petName={pet.name} photos={photos} />

      <section className="mt-8 rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_12px_36px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Pet health</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">Medical Profile</h2><p className="mt-2 text-sm leading-6 text-neutral-600">{medical ? `${[medical.conditions, medical.medications, medical.allergies, medical.careInstructions].filter(Boolean).length * 25}% completed` : "No medical information recorded yet."}</p></div>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.1] px-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10" href={`/dashboard/pets/${pet.id}/medical`}>Manage Medical Profile</Link>
        </div>
        <div className="mt-6 grid gap-4 border-t border-black/[0.06] pt-5 sm:grid-cols-2"><div><p className="text-sm text-neutral-500">Vaccinations</p><p className="mt-1 font-medium text-neutral-950">{vaccinationCount}</p></div><div><p className="text-sm text-neutral-500">Last updated</p><p className="mt-1 font-medium text-neutral-950">{medical ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(medical.updatedAt)) : "Not recorded"}</p></div></div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-neutral-950">Continue setting up</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {futureAreas.map((area) => <article className="rounded-2xl border border-black/[0.07] bg-white p-5" key={area}><h3 className="font-medium text-neutral-950">{area}</h3><p className="mt-1 text-sm leading-6 text-neutral-600">Coming in the next steps.</p></article>)}
        </div>
      </section>
    </section>
  );
}
