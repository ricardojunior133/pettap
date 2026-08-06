import Link from "next/link";
import { notFound } from "next/navigation";

import { LostModeResolveForm } from "@/features/lost-mode/components/LostModeResolveForm";
import { LostReportForm } from "@/features/lost-mode/components/LostReportForm";
import { LostReportService } from "@/features/lost-mode/services/lost-report-service";
import { createPetService } from "@/features/pets/services/pet-service";

export default async function LostPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await createPetService().getPet(petId);
  if (!pet) notFound();

  const activeReport = await new LostReportService().active(petId);

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        className="text-sm text-neutral-600 transition hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
        href={`/dashboard/pets/${petId}`}
      >
        ← Back to {pet.name}
      </Link>

      {activeReport ? (
        <>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[.16em] text-amber-700">
            Lost mode active
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">
            Help bring {pet.name} home
          </h1>
          <dl className="mt-8 space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-sm">
            <div>
              <dt className="text-neutral-600">Last known area</dt>
              <dd className="mt-1 font-semibold">
                {activeReport.details.lastSeenLocation ?? "Not shared"}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-600">Public message</dt>
              <dd className="mt-1 font-semibold">
                {activeReport.details.publicMessage ?? "Not shared"}
              </dd>
            </div>
          </dl>
          <LostModeResolveForm
            lostReportId={activeReport.id}
            petId={petId}
            petName={pet.name}
          />
        </>
      ) : (
        <>
          <h1 className="mt-8 text-4xl font-semibold tracking-[-.05em]">
            Mark {pet.name} as lost
          </h1>
          <p className="mt-3 text-neutral-600">
            Create a private alert. A public rescue page will remain unavailable
            until the platform launch.
          </p>
          <LostReportForm petId={petId} />
        </>
      )}
    </section>
  );
}
