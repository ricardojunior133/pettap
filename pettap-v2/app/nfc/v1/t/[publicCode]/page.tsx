import { headers } from "next/headers";
import Image from "next/image";

import { PublicContactRequestForm } from "@/features/contact-requests/components/public-contact-request-form";
import { presentPublicLostPage } from "@/features/nfc/public-lost-page-presenter";
import { PublicTagResolverService, type PublicPetProfileDto } from "@/features/nfc/services/public-tag-resolver-service";

export const metadata = { robots:{index:false,follow:false} };
export const dynamic="force-dynamic";
export const revalidate=0;

function PublicPetProfile({ profile }: { profile: PublicPetProfileDto }) {
  return <section className="mt-7 rounded-3xl border border-neutral-200 p-6"><h2 className="text-xl font-semibold">{profile.name ?? "PetTap pet"}</h2>{profile.species ? <p className="mt-1 text-neutral-600">{[profile.species, profile.breed].filter(Boolean).join(" · ")}</p> : null}{profile.age ? <p className="mt-2 text-sm text-neutral-600">{profile.age}</p> : null}{profile.message ? <p className="mt-4 text-sm leading-6 text-neutral-700">{profile.message}</p> : null}</section>;
}

export default async function PublicTagPage({ params }: { params: Promise<{ publicCode: string }> }) {
  const { publicCode } = await params;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const r = await new PublicTagResolverService().resolveByPublicCode({ publicCode, ip });
  if(r.state==="lost") {
    const view = presentPublicLostPage(r.profile);
    return <main className="mx-auto max-w-lg px-6 py-12"><p className="text-sm font-semibold uppercase tracking-[.16em] text-rose-700">{view.eyebrow}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">{view.headline}</h1><p className="mt-3 text-neutral-600">{view.safetyMessage}</p>{view.photoUrl ? <Image className="mt-7 aspect-[4/3] w-full rounded-3xl object-cover" src={view.photoUrl} alt={view.name ?? "Reported missing pet"} width={800} height={600} unoptimized /> : null}<PublicPetProfile profile={r.profile} />{view.reportedAt ? <p className="mt-4 text-sm text-neutral-600">Reported missing since {view.reportedAt}</p> : null}<section className="mt-6"><h2 className="text-xl font-semibold">Contact the owner</h2><p className="mt-1 text-sm text-neutral-600">Your message is sent through PetTap. The owner’s contact information remains private.</p><PublicContactRequestForm publicCode={publicCode} /></section></main>;
  }
  if (r.state === "active") return <main className="mx-auto max-w-lg px-6 py-12"><p className="text-sm font-semibold uppercase tracking-[.16em] text-emerald-700">PetTap</p>{r.profile.photoUrl ? <Image className="mt-5 aspect-[4/3] w-full rounded-3xl object-cover" src={r.profile.photoUrl} alt={r.profile.name ?? "PetTap pet"} width={800} height={600} unoptimized /> : null}<PublicPetProfile profile={r.profile} /></main>;
  const message = r.state === "not_activated" ? "This PetTap has not been configured yet." : "This PetTap is unavailable.";
  return <main className="mx-auto max-w-lg px-6 py-12"><h1 className="text-3xl font-semibold">PetTap</h1><p className="mt-3 text-neutral-600">{message}</p></main>;
}
