import Image from "next/image";
import { AlertTriangle, BadgeCheck, CalendarDays, MapPin, ShieldCheck } from "lucide-react";

import type { RescueProfile } from "@/src/lib/domain/rescue";

export default function RescueHero({ profile }: { profile: RescueProfile }) {
  if (profile.lostMode) {
    return (
      <section className="relative min-h-[570px] overflow-hidden bg-[#241b1a] sm:min-h-[620px]" aria-labelledby="lost-pet-name">
        {profile.pet.photo ? <Image src={profile.pet.photo} alt={profile.pet.name} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover object-center" /> : <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-600" aria-hidden="true" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#211412] via-[#211412]/35 to-[#211412]/10" />
        <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-white backdrop-blur-md sm:left-7 sm:top-7"><ShieldCheck className="h-4 w-4 text-rose-200" />PETTAP RESCUE</div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-500/95 px-3 py-1.5 text-sm font-semibold text-white shadow-lg"><AlertTriangle className="h-4 w-4" />LOST PET</span>
          <h1 id="lost-pet-name" className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{profile.pet.name} is currently lost.</h1>
          <p className="mt-2 text-lg text-white/85 sm:text-xl">Please help reunite {profile.pet.name} with his family.</p>
          <p className="mt-2 text-sm font-medium text-white/75">{profile.pet.breed}</p>
          {profile.lastSeenLocation && <div className="mt-6 max-w-md rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-100">Last seen</p><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-white"><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-rose-200" />{profile.lastSeenLocation}</span>{profile.lastSeenDate && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-rose-200" />{profile.lastSeenDate}{profile.lastSeenTime ? ` at ${profile.lastSeenTime}` : ""}</span>}</div></div>}
          {profile.rewardAvailable && <p className="mt-4 text-sm font-medium text-rose-100">Reward available</p>}
        </div>
      </section>
    );
  }

  const status = {
    "safe-at-home": "Safe at home",
    missing: "Missing",
    travelling: "Travelling",
    "veterinary-visit": "Veterinary visit",
    training: "Training",
  }[profile.petStatus ?? "safe-at-home"];

  return (
    <section className="relative min-h-[430px] overflow-hidden bg-neutral-900 sm:min-h-[500px]">
      {profile.pet.photo ? <Image src={profile.pet.photo} alt={profile.pet.name} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover object-center" /> : <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-neutral-200" aria-hidden="true" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-white backdrop-blur-md sm:left-7 sm:top-7"><ShieldCheck className="h-4 w-4 text-emerald-300" />PETTAP RESCUE</div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/95 px-3 py-1.5 text-sm font-semibold shadow-lg"><BadgeCheck className="h-4 w-4" />{status}{profile.pet.friendly ? " · Friendly" : ""}</span>
        <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">{profile.pet.name}</h1><p className="mt-2 text-lg text-white/85 sm:text-xl">{profile.pet.breed}</p>
        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-base text-white/85"><div><dt className="sr-only">Age</dt><dd>{profile.pet.age}</dd></div><div><dt className="sr-only">Sex</dt><dd>{profile.pet.sex}</dd></div></dl>
      </div>
    </section>
  );
}
