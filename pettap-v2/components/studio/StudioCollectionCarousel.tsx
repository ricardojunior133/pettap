"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { premiumEase } from "@/lib/theme/motion";
import { cn } from "@/lib/utils";
import { studioCollections, type StudioCollectionId } from "@/lib/studio/options";

interface StudioCollectionCarouselProps {
  selectedId: string | null;
  onSelect: (collectionId: StudioCollectionId) => void;
}

function CollectionCover({ collection, active }: { collection: typeof studioCollections[number]; active: boolean }) {
  const [hasFallback, setHasFallback] = useState(false);

  return <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: collection.accent }}>
    {hasFallback ? <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.86),transparent_38%),linear-gradient(135deg,rgba(17,17,17,0.04),rgba(255,255,255,0.55))]" /> : <Image fill sizes="(max-width: 640px) 72vw, 256px" src={collection.coverImage} alt="" aria-hidden="true" onError={() => setHasFallback(true)} className={cn("object-cover transition duration-300", active ? "scale-[1.03] saturate-100" : "scale-100 saturate-[0.72]")} />}
    <div className={cn("absolute inset-0 bg-gradient-to-t", active ? "from-black/40 via-transparent to-white/10" : "from-black/30 via-transparent to-white/20")} />
  </div>;
}

/**
 * A scroll-snap gallery instead of a select control keeps every collection
 * discoverable while giving the active collection a quiet, premium emphasis.
 */
export default function StudioCollectionCarousel({ selectedId, onSelect }: StudioCollectionCarouselProps) {
  const reducedMotion = useReducedMotion();
  const cards = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!selectedId) return;
    const frame = window.requestAnimationFrame(() => {
      cards.current.get(selectedId)?.scrollIntoView({ block: "nearest", inline: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedId]);

  function selectCollection(collectionId: StudioCollectionId) {
    onSelect(collectionId);
    cards.current.get(collectionId)?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  return (
    <div className="relative -mx-6 sm:-mx-8" aria-label="PetTap collections">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-7 bg-gradient-to-r from-white to-transparent sm:w-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-gradient-to-l from-white to-transparent sm:w-10" aria-hidden="true" />
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[14vw] pb-4 pt-3 [scrollbar-width:thin] sm:gap-4 sm:px-[calc(50%-8rem)]">
        {studioCollections.map((collection) => {
          const active = selectedId === collection.id;

          return (
            <motion.button
              key={collection.id}
              ref={(element) => {
                if (element) cards.current.set(collection.id, element);
                else cards.current.delete(collection.id);
              }}
              type="button"
              onClick={() => selectCollection(collection.id)}
              aria-pressed={active}
              aria-label={`${collection.title}: ${collection.description}`}
              animate={reducedMotion ? undefined : {
                opacity: active ? 1 : 0.72,
                scale: active ? 1.06 : 0.94,
                y: active ? -3 : 2,
                boxShadow: active
                  ? "0 22px 44px rgba(17,17,17,0.16)"
                  : "0 8px 20px rgba(17,17,17,0.055)",
              }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: premiumEase }}
              className={cn(
                "group relative w-[min(72vw,17rem)] shrink-0 snap-center overflow-hidden rounded-[1.75rem] border text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-neutral-950/20 sm:w-64",
                active ? "z-[1] border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.09] bg-white text-neutral-950 hover:border-black/25",
              )}
            >
              <div className="relative">
                <CollectionCover collection={collection} active={active} />
                {active ? <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur-sm">Selected</Badge> : null}
              </div>
              <div className="min-h-28 p-5">
                <span className={cn("text-base font-semibold tracking-[-0.025em]", active ? "text-white" : "text-neutral-950")}>{collection.title}</span>
                <span className={cn("mt-2 block text-sm leading-5", active ? "text-white/72" : "text-neutral-500")}>{collection.description}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <p className="px-6 text-center text-xs text-neutral-500 sm:px-8">Swipe, scroll or select a collection to explore its five designs.</p>
    </div>
  );
}
