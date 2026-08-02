"use client";

import { Check, Radio, ShieldCheck, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";
import { SectionHeader } from "./ui/SectionHeader";
import { motionTokens, premiumEase } from "./theme/motion";
import { spacing } from "./theme/spacing";

import PersonalisationControls from "./PersonalisationControls";
import ProductPreview from "./ProductPreview";
import type { ProductAccentColour, ProductName, ProductPrimaryColour, ProductShape, ProductSide, ProductSize } from "./productShowcaseOptions";

const productFeatures: readonly { title: string; description: string; icon: LucideIcon }[] = [
  { title: "Personalised name", description: "Made unmistakably theirs.", icon: Check },
  { title: "Everyday material", description: "Lightweight and comfortable to wear.", icon: ShieldCheck },
  { title: "Matte finish", description: "A calm, considered look.", icon: Check },
  { title: "Built-in NFC", description: "A simple tap opens the profile you choose to share.", icon: Radio },
];

export default function ProductShowcase() {
  const [name, setName] = useState<ProductName>("Charlie");
  const [shape, setShape] = useState<ProductShape>("Round");
  const [primaryColour, setPrimaryColour] = useState<ProductPrimaryColour>("black");
  const [accentColour, setAccentColour] = useState<ProductAccentColour>("white");
  const [size, setSize] = useState<ProductSize>("Classic");
  const [side, setSide] = useState<ProductSide>("front");
  const reducedMotion = useReducedMotion();

  return (
    <section id="product" aria-labelledby="product-showcase-title" className={`relative z-10 scroll-mt-8 overflow-hidden bg-[#f8f8f6] px-6 ${spacing.sectionY}`}>
      <div className="relative mx-auto max-w-6xl lg:px-8">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: reducedMotion ? 0 : 0.55, ease: premiumEase }}>
          <SectionHeader align="center" className="max-w-2xl" eyebrow="Essential Collection" id="product-showcase-title" title="Personalised from every angle" description="Choose the shape, size, colours and name that make your Essential PetTap truly theirs." />
        </motion.div>

        <div className="mt-14 grid items-start gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.75fr)] lg:gap-12">
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reducedMotion ? 0 : motionTokens.duration.reveal, ease: premiumEase }}>
            <ProductPreview name={name} shape={shape} primaryColour={primaryColour} accentColour={accentColour} size={size} side={side} />
            <p className="mt-5 text-center text-xs leading-5 text-neutral-500">A visual demonstration of your PetTap. Choices here stay on this page.</p>
          </motion.div>
          <PersonalisationControls name={name} shape={shape} primaryColour={primaryColour} accentColour={accentColour} size={size} side={side} onNameChange={setName} onShapeChange={setShape} onPrimaryColourChange={setPrimaryColour} onAccentColourChange={setAccentColour} onSizeChange={setSize} onSideChange={setSide} />
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {productFeatures.map(({ title, description, icon: Icon }) => <Card key={title} variant="outlined" className="rounded-2xl bg-white/70 p-4"><Icon className="size-4 text-neutral-900" aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-neutral-900">{title}</p><p className="mt-1 text-xs leading-5 text-neutral-600">{description}</p></Card>)}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/studio?collection=essential" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.13)] transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none">Start personalising</Link>
          <a href="#collections" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-black/[0.09] bg-white/80 px-6 text-sm font-semibold text-neutral-800 transition duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none">View all collections</a>
        </div>
      </div>
    </section>
  );
}
