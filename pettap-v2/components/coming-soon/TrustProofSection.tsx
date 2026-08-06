"use client";

import { Battery, Check, Droplets, MapPin, Smartphone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const trustPoints = [
  {
    title: "No subscription",
    description: "One purchase. No monthly fees.",
    icon: Check,
  },
  {
    title: "No battery",
    description: "Always ready when needed.",
    icon: Battery,
  },
  {
    title: "Works with iPhone & Android",
    description: "No app required.",
    icon: Smartphone,
  },
  {
    title: "Waterproof",
    description: "Made for everyday adventures.",
    icon: Droplets,
  },
  {
    title: "Designed in the UK",
    description: "Built with pet owners in mind.",
    icon: MapPin,
  },
] as const;

const proofMessages = [
  "Tap. Scan. Reunite.",
  "Update details anytime",
  "Secure pet profile",
  "Personalised for your pet",
] as const;

/** A compact product-proof layer for the public launch page. */
export default function TrustProofSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="trust-proof-title" className="relative z-10 px-6 pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-black/[0.07] bg-white/75 shadow-[0_18px_50px_rgba(17,17,17,0.045)] backdrop-blur-sm sm:rounded-[2.5rem]">
          <h2 id="trust-proof-title" className="sr-only">Why choose PetTap</h2>
          <motion.ul
            initial={reducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.07 } },
            }}
            className="grid divide-y divide-black/[0.06] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-5"
          >
            {trustPoints.map(({ title, description, icon: Icon }, index) => (
              <motion.li
                key={title}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={`group px-5 py-6 sm:px-6 lg:px-5 ${index === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="flex items-start gap-3.5 lg:block">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-neutral-950 text-white shadow-[0_6px_16px_rgba(17,17,17,0.12)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_20px_rgba(17,17,17,0.16)] motion-reduce:transition-none">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 lg:mt-4">
                    <h3 className="text-sm font-semibold tracking-[-0.02em] text-neutral-900">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-neutral-600">{description}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          <div className="border-t border-black/[0.06] bg-neutral-950 px-5 py-3.5 text-white sm:px-7">
            <ul aria-label="PetTap product promises" className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80 sm:justify-between">
              {proofMessages.map((message) => (
                <li key={message} className="flex items-center gap-2 whitespace-nowrap">
                  <span aria-hidden="true" className="size-1 rounded-full bg-white/60" />
                  {message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
