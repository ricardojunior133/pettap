"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CollectionArtwork } from "@/components/studio/preview/CollectionArtwork";
import { COLLECTION_MODELS, modelsForCollection } from "@/lib/domain/collections";
import type { CollectionModel } from "@/lib/domain/collections";
import { motionTokens, premiumEase } from "@/lib/theme/motion";

type HomeCollectionId = "essential" | "breed" | "cat" | "nature" | "luxury" | "kids" | "celebration" | "seasonal";

const showcaseColourPairs = [
  { primaryColour: "#111111", accentColour: "#F5F5F5" },
  { primaryColour: "#2563EB", accentColour: "#F5F5F5" },
  { primaryColour: "#B42318", accentColour: "#F5F5F5" },
  { primaryColour: "#166534", accentColour: "#F5F5F5" },
  { primaryColour: "#7C3AED", accentColour: "#F5F5F5" },
  { primaryColour: "#F5F5F5", accentColour: "#111111" },
  { primaryColour: "#111111", accentColour: "#C99B45" },
] as const;

export interface AnimatedCollectionCardProps {
  collectionId: HomeCollectionId;
  title: string;
  description: string;
  badge?: string;
  intervalMs?: number;
  initialDelayMs?: number;
}

function modelsForHomeCollection(collectionId: HomeCollectionId): readonly CollectionModel[] {
  if (collectionId === "cat") return modelsForCollection("cats");
  if (collectionId === "seasonal") return COLLECTION_MODELS.filter((model) => model.season !== undefined);
  return modelsForCollection(collectionId);
}

function studioCollectionParam(collectionId: HomeCollectionId) {
  return collectionId;
}

export function AnimatedCollectionCard({ collectionId, title, description, badge, intervalMs = 3200, initialDelayMs = 0 }: AnimatedCollectionCardProps) {
  const reducedMotion = useReducedMotion();
  const models = useMemo(() => modelsForHomeCollection(collectionId), [collectionId]);
  const [modelIndex, setModelIndex] = useState(0);
  const [colourIndex, setColourIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const currentModel = models[modelIndex] ?? null;
  const currentColours = showcaseColourPairs[colourIndex % showcaseColourPairs.length];

  useEffect(() => {
    const updateVisibility = () => setIsPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (reducedMotion || isPaused || !isPageVisible || models.length < 2) return;
    const delay = modelIndex === 0 ? initialDelayMs || intervalMs : intervalMs;
    const timer = window.setTimeout(() => {
      setModelIndex((current) => (current + 1) % models.length);
      setColourIndex((current) => (current + 1) % showcaseColourPairs.length);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [colourIndex, initialDelayMs, intervalMs, isPageVisible, isPaused, modelIndex, models.length, reducedMotion]);

  const href = currentModel
    ? `/studio?${new URLSearchParams({ collection: studioCollectionParam(collectionId), model: currentModel.id, primaryColour: currentColours.primaryColour, accentColour: currentColours.accentColour, ...(currentModel.season ? { season: currentModel.season } : {}) }).toString()}`
    : `/studio?collection=${studioCollectionParam(collectionId)}`;

  return <motion.article
    initial={reducedMotion ? false : { opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: reducedMotion ? 0 : motionTokens.duration.standard, ease: premiumEase }}
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}
    onFocusCapture={() => setIsPaused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false); }}
    className="group relative overflow-hidden rounded-[2rem] border border-black/[0.07] bg-[#fcfcfb] p-5 text-neutral-950 shadow-[0_12px_35px_rgba(17,17,17,0.035)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(17,17,17,0.08)] motion-reduce:transition-none sm:p-6"
  >
    <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_50%_42%,#fff_0%,#f0efeb_80%)]">
      <AnimatePresence mode="wait" initial={false}>
        {currentModel ? <motion.div key={`${currentModel.id}-${colourIndex}`} initial={reducedMotion ? false : { opacity: 0, scale: 0.96, filter: "blur(3px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, filter: "blur(3px)" }} transition={{ duration: reducedMotion ? 0 : 0.42, ease: premiumEase }} className="flex size-full items-center justify-center p-4">
          <CollectionArtwork artwork={currentModel.artwork} primaryColour={currentColours.primaryColour} accentColour={currentColours.accentColour} className="h-full max-w-[76%]" />
        </motion.div> : <span className="text-sm font-medium text-neutral-500">Designs coming soon</span>}
      </AnimatePresence>
      {currentModel?.season ? <span aria-hidden="true" className="absolute left-3 top-3 rounded-full border border-black/[0.07] bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-600">{currentModel.season}</span> : null}
      {currentModel ? <span aria-hidden="true" className="absolute bottom-3 rounded-full border border-black/[0.07] bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm">{currentModel.name}</span> : null}
    </div>

    <div className="mt-6 flex items-start justify-between gap-4">
      <div>{badge ? <span className="inline-flex rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-600">{badge}</span> : null}<h3 className={`font-semibold tracking-[-0.035em] ${badge ? "mt-3 text-xl" : "text-xl"}`}>{title}</h3></div>
      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-neutral-700 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"><ArrowUpRight className="size-4" /></span>
    </div>
    <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
    <Link href={href} aria-label={`Explore ${title}${currentModel ? `, ${currentModel.name}` : ""} in Studio`} className="mt-5 inline-flex min-h-11 items-center rounded-xl text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">Explore in Studio</Link>
  </motion.article>;
}

export { showcaseColourPairs, modelsForHomeCollection };
