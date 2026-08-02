"use client";

import { motion, useReducedMotion } from "framer-motion";

import { SectionHeader } from "./ui/SectionHeader";
import { spacing } from "./theme/spacing";

import { homeCollections } from "./collectionsData";
import { AnimatedCollectionCard } from "./AnimatedCollectionCard";

export default function CollectionsShowcase() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="collections" aria-labelledby="collections-title" className={`relative z-10 overflow-hidden bg-white px-6 ${spacing.sectionY}`}>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-14rem] size-[38rem] -translate-x-1/2 rounded-full bg-slate-100/75 blur-3xl" />
      <div className="relative mx-auto max-w-6xl lg:px-8">
        <SectionHeader align="center" className="max-w-2xl" eyebrow="Collections" id="collections-title" title="A style for every personality" description="Explore signature PetTap designs made for every companion, occasion and personality." />

        <motion.div
          initial={reducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.08 } } }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
        >
          {homeCollections.map(({ id, title, description, badge }) => <AnimatedCollectionCard key={id} collectionId={id} title={title} description={description} badge={badge} initialDelayMs={{ essential: 0, breed: 250, cat: 500, nature: 750, luxury: 1000, kids: 1250, celebration: 1500, seasonal: 1750 }[id]} />)}
        </motion.div>
      </div>
    </section>
  );
}
