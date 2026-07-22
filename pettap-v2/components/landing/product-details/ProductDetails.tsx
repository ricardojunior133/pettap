"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CreditCard, PackageCheck, ScanLine, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";

import Container from "@/components/layout/Container";

const INCLUDED_ITEMS = [
  ["Your personalised PetTag", "Made to order in your chosen finish."],
  ["NFC-ready activation card", "A clear, guided first step when it arrives."],
  ["Welcome & care guide", "Everything you need to set up with confidence."],
] as const;

const FAQS = [
  ["What is PetTap?", "PetTap is a personalised NFC pet tag designed to make a pet’s essential profile easy to reach when someone finds them."],
  ["How does the NFC tag work?", "A compatible smartphone is held close to the tag. The pet’s public web profile opens in the browser, with clear ways to help contact the owner."],
  ["Does PetTap need an app?", "No. A modern NFC-enabled smartphone opens your pet’s public profile directly in the browser."],
  ["Is there a subscription?", "No. Your PetTag is designed to stay simple: no recurring subscription is required for the core experience."],
  ["Which size should I choose?", "Petite suits cats and toy breeds, Classic is the balanced everyday choice for most dogs, and Explorer is designed for larger companions. You can compare them above or in the Studio."],
  ["Will it work with my phone?", "PetTap uses NFC, the same short-range technology used for contactless payments. It works with modern iPhone and Android phones."],
  ["How is my tag made?", "Each tag is made to order in premium matte PETG, a durable material selected for everyday pet life."],
  ["Is PetTap waterproof?", "The product is being designed for everyday adventures. Final water-resistance specifications will be confirmed following physical product testing."],
  ["How do I activate my PetTap?", "Your welcome box includes an activation card and a simple guided activation flow, ready for when your PetTag arrives."],
  ["What happens if my pet is found?", "A finder can tap the tag with a compatible phone, view the public pet profile and use the contact options you have chosen."],
  ["When will my order be dispatched?", "Personalised PetTags are made to order and normally dispatch within 1–3 working days."],
] as const;

export default function ProductDetails() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="package" className="scroll-mt-24 border-y border-black/[0.05] bg-neutral-50/70 py-24 sm:py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div id="faq" className="scroll-mt-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Made for the journey home</p>
            <h2 className="mt-5 max-w-lg text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-5xl">
              A considered experience, from box to first tap.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600">
              Every PetTag is made for one pet, then packed with the simple guidance needed to make protection feel effortless.
            </p>

            <div className="mt-9 overflow-hidden rounded-[28px] border border-black/[0.07] bg-white p-6 shadow-[0_18px_50px_rgba(17,17,17,0.05)] sm:p-7">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-neutral-950 text-white"><PackageCheck className="size-5" aria-hidden="true" /></span>
                  <div><p className="font-medium text-neutral-950">The PetTap welcome box</p><p className="text-sm text-neutral-500">Made to order. Ready to activate.</p></div>
                </div>
              </div>
              <div className="mt-2 divide-y divide-black/[0.06]">
                {INCLUDED_ITEMS.map(([title, description]) => (
                  <div className="flex gap-3 py-4" key={title}>
                    <Check className="mt-0.5 size-4 shrink-0 text-neutral-900" strokeWidth={2.4} aria-hidden="true" />
                    <div><p className="text-sm font-medium text-neutral-900">{title}</p><p className="mt-1 text-sm leading-5 text-neutral-500">{description}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <DetailPill icon={<ScanLine />} label="NFC only" />
              <DetailPill icon={<ShieldCheck />} label="No subscription" />
              <DetailPill icon={<CreditCard />} label="No app" />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">Questions, answered</p>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">The details that matter.</h3>
            <div className="mt-7 divide-y divide-black/[0.08] rounded-[28px] border border-black/[0.07] bg-white px-5 sm:px-7">
              {FAQS.map(([question, answer], index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={question}>
                    <button type="button" className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-medium text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen}>
                      {question}
                      <ChevronDown className={`size-4 shrink-0 text-neutral-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden"><p className="max-w-xl pb-5 text-sm leading-6 text-neutral-600">{answer}</p></motion.div>}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function DetailPill({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="flex min-h-20 flex-col justify-center rounded-2xl border border-black/[0.06] bg-white px-3 text-center shadow-sm"><span className="mx-auto [&>svg]:size-4" aria-hidden="true">{icon}</span><span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-600">{label}</span></div>;
}
