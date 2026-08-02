"use client";

import Image from "next/image";
import { Droplets, MapPin, Radio, Smartphone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { HOME_HERO_ALT, HOME_HERO_IMAGE } from "./homeAssets";

const proofPoints = [
  { label: "Designed in the UK", icon: MapPin },
  { label: "Works with iPhone & Android", icon: Smartphone },
  { label: "NFC ready", icon: Radio },
  { label: "Waterproof", icon: Droplets },
] as const;

const reveal = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/**
 * The public launch Hero deliberately links to existing on-page discovery
 * points while the Studio remains private until the wider product launches.
 */
export default function PremiumHero() {
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[-16rem] -z-10 h-[48rem] bg-[radial-gradient(ellipse_at_60%_36%,rgba(207,222,239,0.58),transparent_42%),radial-gradient(ellipse_at_18%_30%,rgba(250,236,220,0.52),transparent_34%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[-12rem] top-20 -z-10 size-[28rem] rounded-full bg-sky-100/40 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-24 pt-10 sm:gap-14 sm:pb-32 sm:pt-16 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-8 lg:px-8 lg:pb-36 lg:pt-20">
        <motion.div
          initial={reducedMotion ? false : "hidden"}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.11 } } }}
          className="relative z-10 max-w-2xl text-center lg:text-left"
        >
          <motion.p variants={reveal} transition={transition} className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 shadow-[0_8px_24px_rgba(17,17,17,0.03)]">
            <span aria-hidden="true">🇬🇧</span>
            Designed for safer returns
          </motion.p>

          <motion.h1 id="hero-title" variants={reveal} transition={transition} className="mt-7 text-balance text-[clamp(3.15rem,7vw,5.9rem)] font-semibold leading-[0.94] tracking-[-0.07em] text-neutral-950">
            A thoughtful way back home, for every pet you love.
          </motion.h1>

          <motion.div variants={reveal} transition={transition} className="mx-auto mt-7 max-w-xl text-pretty text-[1.05rem] leading-7 text-neutral-600 lg:mx-0 lg:text-lg lg:leading-8">
            <p>PetTap is a personalised NFC tag that gives a kind finder a simple, private way to reach you when your pet is found.</p>
            <p className="mt-3 font-medium text-neutral-800">Made for everyday adventures. Ready when a little help matters.</p>
          </motion.div>

          <motion.div variants={reveal} transition={transition} className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <a href="#notify" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_16px_32px_rgba(17,17,17,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none">
              Join the Waitlist
            </a>
            <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black/[0.09] bg-white/75 px-6 text-sm font-semibold text-neutral-800 shadow-[0_8px_20px_rgba(17,17,17,0.025)] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none">
              Explore PetTap
            </a>
          </motion.div>

          <motion.ul variants={reveal} transition={transition} className="mt-10 grid gap-3 text-left sm:grid-cols-2 lg:max-w-xl">
            {proofPoints.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-medium text-neutral-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-black/[0.07] bg-white/80 text-neutral-950 shadow-sm">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 26, filter: "blur(12px)" }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...transition, delay: reducedMotion ? 0 : 0.18 }}
          whileHover={reducedMotion ? undefined : { y: -3, scale: 1.012 }}
          className="relative mx-auto w-full max-w-[37rem] transition-transform duration-500 motion-reduce:transition-none lg:max-w-none"
        >
          <motion.div
            animate={reducedMotion ? undefined : { y: [0, -7, 0] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
            className="relative aspect-[0.84] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[#f7f5f1] shadow-[0_36px_90px_rgba(47,53,61,0.14)] sm:rounded-[3rem]"
          >
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_56%_43%,rgba(147,184,225,0.23),transparent_20%),linear-gradient(145deg,rgba(255,255,255,0.72),transparent_40%)]" />
            <Image
              src={HOME_HERO_IMAGE}
              alt={HOME_HERO_ALT}
              fill
              priority
              sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) min(88vw, 592px), 51vw"
              className="scale-[1.035] object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-y-[19%] left-0 w-[36%] bg-[linear-gradient(90deg,rgba(247,245,241,0.32),transparent)]" />
            <div aria-hidden="true" className="absolute left-[43%] top-[19%] size-[38%] rounded-full bg-amber-100/20 blur-3xl" />
            <div aria-hidden="true" className="absolute inset-x-[14%] bottom-[8%] h-12 rounded-full bg-neutral-950/[0.12] blur-2xl" />
            <span aria-hidden="true" className="absolute left-[22%] top-[38%] size-1.5 rounded-full bg-white/75 shadow-[0_0_22px_5px_rgba(205,227,249,0.75)]" />
            <span aria-hidden="true" className="absolute right-[17%] top-[28%] size-1 rounded-full bg-white/70 shadow-[0_0_18px_4px_rgba(236,221,197,0.65)]" />
          </motion.div>
          <div aria-hidden="true" className="absolute -bottom-8 left-[15%] -z-10 h-28 w-[68%] rounded-full bg-slate-300/35 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
