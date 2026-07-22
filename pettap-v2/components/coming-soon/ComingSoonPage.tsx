import Image from "next/image";
import { AtSign, BriefcaseBusiness, Camera, Check, LockKeyhole, MessageCircle, Music2, Radio, ShieldCheck } from "lucide-react";

import { launchConfig } from "@/lib/launch/config";

import LaunchFooter from "./LaunchFooter";
import LaunchNavigation from "./LaunchNavigation";
import ProductShowcase from "./ProductShowcase";
import WaitlistForm from "./WaitlistForm";

const quickFeatures = [
  ["No app required", Radio],
  ["Secure & private", LockKeyhole],
  ["Waterproof & durable", ShieldCheck],
  ["Works worldwide", Check],
] as const;

const howItWorks = [
  {
    number: "01",
    title: "Tap the tag",
    description: "Anyone can tap your PetTap using any NFC-enabled smartphone.",
    image: "/images/how-it-works-scan.png",
    alt: "A fawn pug wearing a black PetTap tag as a smartphone scans the tag at its collar.",
  },
  {
    number: "02",
    title: "View the profile",
    description: "Your pet profile opens instantly. No app required.",
    image: "/images/how-it-works-profile.png",
    alt: "A smartphone displays a fawn pug's PetTap profile with owner and emergency contact details.",
  },
  {
    number: "03",
    title: "Bring them home",
    description: "The finder can securely contact the owner and help reunite your pet.",
    image: "/images/how-it-works-reunion.png",
    alt: "A fawn pug wearing a black PetTap tag is warmly reunited with its owner.",
  },
] as const;

const benefits = [
  ["No app required", "Works instantly with NFC smartphones.", Radio],
  ["Secure & private", "Only the information you choose is shared.", LockKeyhole],
  ["Waterproof & durable", "Designed for everyday adventures.", ShieldCheck],
  ["Works worldwide", "Compatible with modern NFC smartphones globally.", Check],
] as const;

const socialPlatforms = [
  { label: "Instagram", icon: Camera, url: launchConfig.instagramUrl },
  { label: "Facebook", icon: MessageCircle, url: null },
  { label: "TikTok", icon: Music2, url: null },
  { label: "LinkedIn", icon: BriefcaseBusiness, url: null },
  { label: "X", icon: AtSign, url: null },
] as const;

export default function ComingSoonPage() {
  const followUrl = launchConfig.instagramUrl;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fbfbfa] text-neutral-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] bg-[radial-gradient(circle_at_50%_20%,rgba(217,229,242,0.55),transparent_58%)]" />

      <LaunchNavigation showAbout />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-12 pt-20 text-center sm:pb-16 sm:pt-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
          <span aria-hidden="true">{"\uD83C\uDDEC\uD83C\uDDE7"}</span>
          Launching soon
        </p>
        <h1 className="mt-7 text-5xl font-semibold tracking-[-0.065em] text-neutral-950 sm:text-7xl">A simple tap can bring them home.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">Premium NFC pet tags that instantly connect anyone who finds your pet to their secure online profile.</p>
        <p className="mt-2 text-base font-medium text-neutral-700">No app required.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#how-it-works" className="inline-flex min-h-12 items-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none">
            Learn More
          </a>
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-x-5 gap-y-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {quickFeatures.map(([label, Icon]) => (
            <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-neutral-700">
              <Icon className="size-4 text-neutral-950" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      <ProductShowcase />

      <section id="how-it-works" className="relative z-10 border-y border-black/[0.06] bg-white/65 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">How it works</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Tap. Scan. Reunite.</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {howItWorks.map(({ number, title, description, image, alt }) => (
              <article key={title} className="group rounded-[28px] border border-black/[0.07] bg-white p-7 shadow-[0_12px_35px_rgba(17,17,17,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(17,17,17,0.07)] motion-reduce:transition-none">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 33vw, 360px"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-neutral-600 shadow-sm">{number}</span>
                </div>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Why PetTap</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Made for the moments that matter.</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([title, description, Icon]) => (
              <article key={title} className="rounded-[28px] border border-black/[0.07] bg-white p-7 shadow-[0_12px_35px_rgba(17,17,17,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(17,17,17,0.06)] motion-reduce:transition-none">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-neutral-950 text-white"><Icon className="size-4" aria-hidden="true" /></span>
                <h3 className="mt-7 text-xl font-semibold tracking-[-0.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="notify" className="relative z-10 px-6 py-24 text-center sm:py-32">
        {launchConfig.waitlistEnabled ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">PetTap launch</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Be the first to know.</h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-neutral-600">Join the list for launch news and early access to PetTap.</p>
            <div className="mt-9"><WaitlistForm /></div>
          </>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">PetTap launch</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Follow the PetTap journey.</h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-neutral-600">Follow us on social media as we prepare for launch.</p>
            {followUrl && <a href={followUrl} target="_blank" rel="noreferrer" className="mt-9 inline-flex min-h-12 items-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">Follow the PetTap journey</a>}
          </>
        )}
      </section>

      <section className="relative z-10 border-t border-black/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
          <p className="text-sm font-medium text-neutral-600">Follow along</p>
          <div className="flex items-center gap-2">
            {socialPlatforms.map(({ label, icon: Icon, url }) => url ? (
              <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="flex size-10 items-center justify-center rounded-xl border border-black/[0.08] text-neutral-700 transition hover:bg-white"><Icon className="size-4" /></a>
            ) : (
              <span key={label} aria-label={`${label} coming soon`} title={`${label} coming soon`} className="flex size-10 cursor-not-allowed items-center justify-center rounded-xl border border-black/[0.06] text-neutral-300"><Icon className="size-4" /></span>
            ))}
          </div>
        </div>
      </section>

      <LaunchFooter />
    </main>
  );
}
