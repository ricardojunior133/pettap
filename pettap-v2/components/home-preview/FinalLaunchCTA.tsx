"use client";

import { ArrowRight, Check, LockKeyhole, MapPin, Radio } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import WaitlistForm from "./WaitlistForm";

const trustItems = [
  ["No subscription", Check],
  ["No battery", Radio],
  ["Privacy controls", LockKeyhole],
  ["Designed in the UK", MapPin],
] as const;

interface FinalLaunchCTAProps {
  waitlistEnabled: boolean;
  followUrl: string | null;
}

export default function FinalLaunchCTA({ waitlistEnabled, followUrl }: FinalLaunchCTAProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section id="notify" aria-labelledby="launch-cta-title" className="relative z-10 overflow-hidden bg-neutral-950 px-6 py-24 text-white sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-18rem] size-[42rem] -translate-x-1/2 rounded-full bg-sky-300/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-11rem] right-[-9rem] size-[27rem] rounded-full border border-white/[0.07]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-7rem] right-[-5rem] size-[19rem] rounded-full border border-white/[0.05]" />
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Coming soon</p>
        <h2 id="launch-cta-title" className="mt-5 text-balance text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">A safer way home is almost here</h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">PetTap combines a personalised NFC tag with a secure pet profile, helping someone contact you when your pet is found.</p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/55">Be among the first to discover PetTap collections, launch updates and early access.</p>

        <div className="mx-auto mt-9 max-w-xl">
          {waitlistEnabled ? <WaitlistForm /> : <DisabledWaitlist followUrl={followUrl} />}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2.5 text-sm sm:flex-row sm:gap-5">
          <a href="#product" className="rounded-sm font-semibold text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950">Explore the product <span aria-hidden="true">→</span></a>
          <span aria-hidden="true" className="hidden text-white/25 sm:inline">·</span>
          <a href="#how-it-works" className="rounded-sm font-semibold text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-neutral-950">See how it works <span aria-hidden="true">→</span></a>
        </div>

        <ul className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-3 border-t border-white/[0.1] pt-7 text-xs font-medium text-white/65 sm:gap-x-7">
          {trustItems.map(([label, Icon]) => <li key={label} className="flex items-center gap-2"><Icon className="size-3.5 text-white/80" aria-hidden="true" />{label}</li>)}
        </ul>
      </motion.div>
    </section>
  );
}

function DisabledWaitlist({ followUrl }: { followUrl: string | null }) {
  if (followUrl) {
    return <a href={followUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-neutral-950 transition duration-300 hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 motion-reduce:transition-none">Follow the launch journey <ArrowRight className="size-4" aria-hidden="true" /></a>;
  }

  return <p role="status" className="rounded-2xl border border-white/[0.12] bg-white/[0.06] px-5 py-4 text-sm font-medium text-white/75">Launch updates coming soon.</p>;
}
