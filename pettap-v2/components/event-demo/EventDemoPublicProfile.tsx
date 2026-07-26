import Link from "next/link";
import { CalendarDays, Heart, Mail, PawPrint, Phone, Radio, ShieldCheck, Sparkles, UserRound } from "lucide-react";

import { EventDemoPetPhoto } from "@/components/event-demo/EventDemoPetPhoto";
import { EventDemoProfileMotion } from "@/components/event-demo/EventDemoProfileMotion";
import type { EventDemoPublicProfile as EventDemoProfile } from "@/features/event-demo/services/event-demo-public-profile-service";

const orange = "#ff7900";
const navy = "#07152e";
const primaryLink = "inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#075a24] px-5 text-base font-semibold text-white shadow-[0_12px_25px_rgba(7,90,36,0.16)] transition hover:bg-[#064b1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075a24]";
const secondaryLink = "inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#075a24] bg-white px-5 text-base font-semibold text-[#075a24] transition hover:bg-[#f4faf5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075a24]";

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return <div className="flex gap-4 border-t border-neutral-200 py-4 first:border-t-0 first:pt-0"><span aria-hidden="true" className="mt-0.5 text-[#07152e]">{icon}</span><div><p className="text-sm text-neutral-500">{label}</p><p className="mt-0.5 text-base font-semibold text-[#07152e]">{value}</p></div></div>;
}

function PhotoFallback({ petName }: { petName: string }) {
  return <div aria-label="Pet photo unavailable" className="flex aspect-[4/3] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#fff3e5] via-white to-neutral-100 text-center shadow-[0_18px_55px_rgba(0,0,0,0.08)]"><div><span aria-hidden="true" className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">🐾</span><p className="mt-4 text-base font-semibold text-[#07152e]">A photo of {petName} is not available yet.</p><p className="mt-1 text-sm text-neutral-500">Their approved details are still here to help.</p></div></div>;
}

export function EventDemoPublicProfile({ profile }: { profile: EventDemoProfile }) {
  const contactAvailable = Boolean(profile.contactTelephone || profile.contactEmail);
  const ownerInitial = profile.ownerFirstName?.slice(0, 1).toUpperCase();
  const isFriendly = Boolean(profile.personality?.toLowerCase().includes("friendly"));
  const detailsAvailable = Boolean(profile.breed || profile.age || profile.personality);

  return <main className="min-h-screen bg-[#f7f8fa] px-3 py-3 text-[#07152e] sm:px-6 sm:py-8">
    <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_18px_55px_rgba(7,21,46,0.12)]">
      <header className="flex min-h-16 items-center justify-between bg-[#07152e] px-5 text-white sm:px-8">
        <Link aria-label="PetTap home" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight" href="/"><PawPrint aria-hidden="true" className="size-7" />pettap</Link>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold tracking-wide text-[#ffb45e] sm:text-sm"><Radio aria-hidden="true" className="size-4" />LIVE EVENT DEMO</span>
      </header>

      <div className="p-5 sm:p-10">
        <EventDemoProfileMotion>
          <section className="grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
            <div><p className="flex items-center gap-2 text-sm font-bold tracking-wide" style={{ color: orange }}><Radio aria-hidden="true" className="size-4" />LIVE EVENT DEMO</p><h1 className="mt-4 text-4xl font-bold leading-none tracking-[-0.055em] text-[#07152e] sm:text-6xl">Have you found <span style={{ color: orange }}>{profile.petName}</span>? <PawPrint aria-hidden="true" className="inline size-[0.72em]" /></h1><p className="mt-4 text-lg text-[#25314a]">This is a temporary PetTap demonstration profile.</p></div>
            <aside className="rounded-[22px] bg-[#f0f4ef] p-5"><div className="flex items-center gap-3 font-semibold text-[#0b4d22]"><ShieldCheck aria-hidden="true" className="size-5" />{isFriendly ? "Safe & Friendly" : "Private profile"}</div><p className="mt-3 text-sm leading-6 text-[#25314a]">{isFriendly ? `${profile.petName} is friendly and may approach you.` : "Only details approved by the owner are shown here."}</p></aside>
          </section>
        </EventDemoProfileMotion>

        <EventDemoProfileMotion delay={0.06} className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.98fr)]">
          <div className="relative">{profile.photoSignedUrl ? <EventDemoPetPhoto alt={`${profile.petName}, a ${profile.species}`} src={profile.photoSignedUrl} /> : <PhotoFallback petName={profile.petName} />}<span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-[#075a24] px-3 py-2 text-sm font-semibold text-white shadow-lg"><ShieldCheck aria-hidden="true" className="size-4" />Verified Tag</span></div>
          <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_12px_32px_rgba(7,21,46,0.08)] sm:p-7"><div className="flex items-center gap-4 border-b border-neutral-200 pb-5"><span className="flex size-16 items-center justify-center rounded-full bg-[#ffb751] text-[#07152e]"><PawPrint className="size-8" /></span><div><h2 className="text-4xl font-bold tracking-tight">{profile.petName}</h2><p className="mt-1 text-xl font-semibold text-neutral-500 capitalize">{profile.species}</p></div></div><div className="mt-5">{detailsAvailable ? <><Detail icon={<PawPrint className="size-5" />} label="Breed" value={profile.breed} /><Detail icon={<CalendarDays className="size-5" />} label="Age" value={profile.age} /><Detail icon={<Heart className="size-5" />} label="Personality" value={profile.personality} /></> : <p className="rounded-2xl bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">More details about {profile.petName} have not been shared yet.</p>}</div>{profile.personality ? <div className="mt-4 rounded-2xl bg-[#fff6eb] px-4 py-4 text-sm leading-6 text-[#25314a]"><Heart aria-hidden="true" className="mr-3 inline size-5 align-text-bottom" style={{ color: orange }} />{profile.petName} is loved and cared for. Thank you for helping.</div> : null}</section>
        </EventDemoProfileMotion>

        <EventDemoProfileMotion delay={0.1} className="mt-5"><section className="grid gap-5 rounded-[22px] bg-[#07152e] p-5 text-white sm:grid-cols-2 sm:p-6"><div className="flex items-center gap-4"><span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ff9d43] to-[#ce5e15] text-[#07152e]">{ownerInitial ? <span className="text-lg font-bold">{ownerInitial}</span> : <UserRound className="size-6" />}</span><div><p className="text-sm font-semibold text-white/85">Owner</p><p className="mt-1 text-base">{profile.ownerFirstName ?? "Private"}</p></div></div><div className="flex items-center gap-4 border-t border-white/20 pt-5 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15"><ShieldCheck className="size-6" /></span><div><p className="font-semibold">Information is private</p><p className="mt-1 text-sm leading-5 text-white/80">Used only to help reunite {profile.petName} with their owner.</p></div></div></section></EventDemoProfileMotion>

        <EventDemoProfileMotion delay={0.14} className="mt-5"><section aria-labelledby="contact-heading" className="rounded-[22px] border border-neutral-200 bg-white p-5 shadow-[0_10px_26px_rgba(7,21,46,0.05)] sm:p-6"><h2 id="contact-heading" className="text-xl font-bold">Contact the owner</h2><p className="mt-1 text-sm text-[#4c5870]">{profile.ownerFirstName ? `Please contact ${profile.ownerFirstName} directly.` : "Use the approved contact details below."}</p>{contactAvailable ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{profile.contactTelephone ? <a aria-label="Call owner" className={primaryLink} href={`tel:${profile.contactTelephone}`}><Phone aria-hidden="true" className="size-5" />Call owner</a> : null}{profile.contactEmail ? <a aria-label="Email owner" className={secondaryLink} href={`mailto:${profile.contactEmail}`}><Mail aria-hidden="true" className="size-5" />Email owner</a> : null}</div> : <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">Contact details were not shared for this demonstration. Please keep {profile.petName} safe and ask PetTap staff for help.</p>}</section></EventDemoProfileMotion>

        <EventDemoProfileMotion delay={0.18} className="mt-5"><section className="flex flex-col gap-4 rounded-[22px] bg-gradient-to-r from-[#fff4e7] to-[#fffaf5] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="flex items-center gap-4"><span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-[#ffb751] text-[#ff7900]"><Sparkles className="size-7" /></span><div><h2 className="text-xl font-bold">Want PetTap for your pet?</h2><p className="mt-1 text-sm text-[#4c5870]">Smart tags that help pets get home safely.</p></div></div><Link className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-base font-semibold text-white shadow-sm" href="/#waitlist" style={{ background: orange }}>Learn more <span aria-hidden="true" className="text-2xl leading-none">→</span></Link></section></EventDemoProfileMotion>

        <footer className="pt-7 text-center"><div className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight" style={{ color: navy }}><PawPrint aria-hidden="true" className="size-6" />pettap</div><p className="mt-1 text-sm text-[#667085]">Powered by PetTap</p></footer>
      </div>
    </div>
  </main>;
}

export function EventDemoExpiredState() {
  return <main className="min-h-screen bg-[#f7f8fa] px-4 py-16 sm:py-24"><section className="mx-auto max-w-xl rounded-[28px] bg-white p-8 text-center shadow-[0_18px_55px_rgba(7,21,46,0.1)] sm:p-12"><span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#fff4e7] text-[#ff7900]"><ShieldCheck className="size-6" /></span><h1 className="mt-6 text-3xl font-bold tracking-tight" style={{ color: navy }}>This demo profile has expired</h1><p className="mt-4 leading-7 text-neutral-600">For privacy, this temporary pet information has been removed.</p><Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl px-5 font-semibold text-white" href="/" style={{ background: orange }}>Discover PetTap</Link></section></main>;
}
