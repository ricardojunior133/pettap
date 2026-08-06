"use client";

import { Dog, HeartHandshake, PhoneCall, Search, ShieldCheck, SmartphoneNfc } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { motionTokens, premiumEase } from "@/lib/theme/motion";
import { spacing } from "@/lib/theme/spacing";

const steps = [
  {
    title: "Your pet wears a PetTap",
    description: "A personalised NFC tag stays with them through every day and every adventure.",
    icon: Dog,
    image: "/images/how-it-works/step-01-pettap-on-collar.webp",
    imageAlt: "Woman attaching a PetTap tag to a pug's collar indoors.",
  },
  {
    title: "Someone finds your pet",
    description: "A helpful person notices the PetTap on their collar.",
    icon: Search,
    image: "/images/how-it-works/step-02-pet-found.webp",
    imageAlt: "Man approaching a pug wearing a PetTap tag on a busy street.",
  },
  {
    title: "They tap the tag",
    description: "No app, account or special equipment is required.",
    icon: SmartphoneNfc,
    image: "/images/how-it-works/step-03-tap-nfc-tag.webp",
    imageAlt: "Man holding a smartphone close to the PetTap NFC tag on a pug's collar.",
  },
  {
    title: "The secure profile opens",
    description: "Only the information you choose to share is displayed.",
    icon: ShieldCheck,
    image: "/images/how-it-works/step-04-secure-profile.webp",
    imageAlt: "Hand holding a smartphone displaying the secure PetTap profile of a pug named Charlie.",
  },
  {
    title: "They contact you",
    description: "Your approved contact details help them reach you quickly.",
    icon: PhoneCall,
    image: "/images/how-it-works/step-05-contact-owner.webp",
    imageAlt: "Man calling the pet's owner after opening the PetTap profile.",
  },
  {
    title: "You’re safely reunited",
    description: "One simple tap helps bring your best friend home.",
    icon: HeartHandshake,
    image: "/images/how-it-works/step-06-safe-reunion.webp",
    imageAlt: "Woman hugging her reunited pug while the finder smiles in the background.",
  },
] as const;

export default function HowPetTapWorks() {
  const reducedMotion = useReducedMotion();
  const motionDuration = reducedMotion ? 0 : 0.5;

  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className={`relative z-10 overflow-hidden border-y border-black/[0.06] bg-white/65 ${spacing.sectionY}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_50%_0%,rgba(218,230,242,0.42),transparent_68%)]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeader align="center" className="max-w-2xl" eyebrow="How it works" id="how-it-works-title" title="How PetTap brings them home" description="From one simple tap to a safe reunion." />

        <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
          <div aria-hidden="true" className="absolute bottom-8 left-[1.35rem] top-8 w-px bg-black/[0.08] md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            aria-hidden="true"
            initial={reducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: reducedMotion ? 0 : 1.3, ease: premiumEase }}
            className="absolute bottom-8 left-[1.35rem] top-8 w-px origin-top bg-neutral-950 md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="space-y-7 md:space-y-10">
            {steps.map(({ title, description, icon: Icon, image, imageAlt }, index) => {
              const isLeft = index % 2 === 0;
              const isLast = index === steps.length - 1;

              return (
                <li key={title} className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)] md:gap-x-6">
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: motionDuration, delay: reducedMotion ? 0 : motionTokens.stagger }}
                    className="relative z-10 flex size-11 items-center justify-center rounded-2xl border border-black/[0.08] bg-white text-neutral-950 shadow-[0_10px_24px_rgba(17,17,17,0.06)] md:col-start-2 md:row-start-1 md:justify-self-center"
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                    <span className="sr-only">Step {index + 1}</span>
                  </motion.div>

                  <motion.article
                    initial={reducedMotion ? false : { opacity: 0, y: 18, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: motionDuration, delay: reducedMotion ? 0 : 0.12, ease: premiumEase }}
                    className={`group overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-white/90 shadow-[0_12px_35px_rgba(17,17,17,0.035)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(17,17,17,0.07)] motion-reduce:transition-none md:row-start-1 ${isLeft ? "md:col-start-1" : "md:col-start-3"} ${isLast ? "ring-1 ring-sky-100 shadow-[0_16px_42px_rgba(155,185,215,0.16)]" : ""}`}
                  >
                    <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)]">
                      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 sm:aspect-auto sm:min-h-64">
                        <Image src={image} alt={imageAlt} fill sizes="(max-width: 639px) calc(100vw - 5.5rem), (max-width: 767px) 340px, (max-width: 1023px) 32vw, 310px" className="object-cover object-center" />
                      </div>
                      <div className="p-6 sm:p-7">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Step {String(index + 1).padStart(2, "0")}</p>
                        <h3 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-neutral-950">{title}</h3>
                        <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
                        {index === 2 ? <p className="mt-4 text-xs font-semibold text-neutral-800">No app required</p> : null}
                        {index === 3 ? <p className="mt-4 text-xs font-semibold text-neutral-800">Secure profile</p> : null}
                      </div>
                    </div>
                  </motion.article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
