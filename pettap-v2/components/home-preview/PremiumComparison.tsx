"use client";

import { Check, CircleMinus, Radio } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const traditionalTagPoints = [
  "Limited engraving space",
  "Details can become outdated",
  "Difficult to read when worn",
  "No medical information",
  "No emergency contacts",
  "Cannot be updated remotely",
] as const;

const petTapPoints = [
  "Update details anytime",
  "Secure pet profile",
  "Medical information",
  "Emergency contacts",
  "Lost Mode",
  "No subscription",
  "No battery",
  "Works without an app",
] as const;

function ComparisonList({ items, tone }: { items: readonly string[]; tone: "traditional" | "pettap" }) {
  const Icon = tone === "pettap" ? Check : CircleMinus;

  return <ul className="mt-8 space-y-3.5">
    {items.map((item) => <li key={item} className={`flex items-start gap-3 text-sm leading-6 ${tone === "pettap" ? "text-white/85" : "text-neutral-700"}`}><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${tone === "pettap" ? "bg-white text-neutral-950" : "border border-black/[0.09] bg-white text-neutral-500"}`}><Icon className="size-3" aria-hidden="true" /></span>{item}</li>)}
  </ul>;
}

export default function PremiumComparison() {
  const reducedMotion = useReducedMotion();
  const cardMotion = {
    initial: reducedMotion ? false : { opacity: 0, y: 16, filter: "blur(5px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section id="comparison" aria-labelledby="comparison-title" className="relative z-10 overflow-hidden bg-[#f7f6f3] px-6 py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-sky-100/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Why PetTap</p>
          <h2 id="comparison-title" className="mt-5 text-balance text-4xl font-semibold tracking-[-0.055em] text-neutral-950 sm:text-5xl">More than a name on a tag</h2>
          <p className="mt-6 text-pretty text-base leading-7 text-neutral-600 sm:text-lg">Traditional tags can fade, become outdated and hold very little information. PetTap gives you a secure profile you can update whenever life changes.</p>
        </div>

        <div className="mt-14 grid items-stretch gap-4 lg:mt-16 lg:grid-cols-2 lg:gap-6">
          <motion.article {...cardMotion} className="rounded-[2rem] border border-black/[0.07] bg-white/75 p-7 shadow-[0_14px_38px_rgba(17,17,17,0.035)] sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Traditional Pet Tag</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-neutral-900">A simple engraved label</h3>
              </div>
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-black/[0.08] bg-white text-neutral-500 shadow-sm"><CircleMinus className="size-5" /></span>
            </div>
            <ComparisonList items={traditionalTagPoints} tone="traditional" />
          </motion.article>

          <motion.article {...cardMotion} transition={{ ...cardMotion.transition, delay: reducedMotion ? 0 : 0.08 }} className="relative overflow-hidden rounded-[2rem] border border-neutral-950 bg-neutral-950 p-7 text-white shadow-[0_20px_55px_rgba(17,17,17,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(17,17,17,0.22)] motion-reduce:transition-none sm:p-9">
            <div aria-hidden="true" className="absolute right-[-6rem] top-[-7rem] size-72 rounded-full bg-sky-300/20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">PetTap</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">A profile that stays useful</h3>
              </div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">No monthly fees</span>
            </div>
            <div className="relative"><ComparisonList items={petTapPoints} tone="pettap" /></div>
          </motion.article>
        </div>

        <motion.aside
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.15 }}
          className="mx-auto mt-7 flex max-w-4xl items-start gap-3 rounded-2xl border border-black/[0.07] bg-white/75 px-5 py-4 text-left text-sm leading-6 text-neutral-600 shadow-[0_8px_24px_rgba(17,17,17,0.025)]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800"><Radio className="size-4" aria-hidden="true" /></span>
          <p><strong className="font-semibold text-neutral-900">PetTap is not a GPS tracker.</strong> It uses NFC to help someone who finds your pet access the information you choose to share.</p>
        </motion.aside>
      </div>
    </section>
  );
}
