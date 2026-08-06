import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPetTimeline } from "@/features/admin/activity/components/admin-timeline";
import { AdminPetNotFoundError, AdminPetService } from "@/features/admin/pets/services/admin-pet-service";
import { AdminTagService } from "@/features/admin/tags/services/admin-tag-service";

async function loadPet(petId: string) {
  try {
    const pet = await new AdminPetService().get(petId);
    const tags = await new AdminTagService().listForAccount(pet.accountId);
    return { pet, tags: tags.filter((tag) => tag.petId === pet.id) };
  } catch (error) {
    if (error instanceof AdminPetNotFoundError) notFound();
    throw error;
  }
}

export default async function AdminPetDetailPage({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const { pet, tags } = await loadPet(petId);

  return (
    <>
      <Link className="text-sm font-semibold text-neutral-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950" href={`/admin/customers/${pet.accountId}`}>
        Back to customer
      </Link>
      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative size-28 overflow-hidden rounded-[28px] bg-neutral-100">
          {pet.primaryPhotoUrl ? <Image fill alt={`Primary photo of ${pet.name}`} className="object-cover" sizes="112px" src={pet.primaryPhotoUrl} unoptimized /> : <div className="flex size-full items-center justify-center text-sm font-semibold text-neutral-400">No photo</div>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Pet overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{pet.name}</h1>
          <p className="mt-2 text-neutral-600">{pet.species} · Lost Mode {pet.lostModeActive ? "active" : "off"}</p>
        </div>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card label="Tags" value={pet.tagCount} />
        <Card label="Medical information" value={pet.medicalInformationPresent ? "Present" : "Not provided"} />
        <Card label="Public ID" value={pet.publicId} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Associated NFC tags</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {tags.length ? tags.map((tag) => (
            <Link className="rounded-2xl border border-black/[0.07] bg-white p-5" href={`/admin/tags/${tag.id}`} key={tag.id}>
              <p className="font-semibold">{tag.publicId}</p>
              <p className="mt-1 text-sm capitalize text-neutral-600">{tag.status}</p>
            </Link>
          )) : <p className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-6 text-sm text-neutral-600">No NFC tags are associated with this pet.</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Recent activity</h2>
        <div className="mt-4"><AdminPetTimeline petId={pet.id} /></div>
      </section>
    </>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return <article className="rounded-2xl border border-black/[0.07] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></article>;
}
