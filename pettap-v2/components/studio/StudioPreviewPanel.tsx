"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { premiumEase } from "@/lib/theme/motion";
import { designAllowsPetName, findStudioLabel, studioColours, studioPreviewDesignId } from "@/lib/studio/options";

import { useStudio } from "./StudioContext";
import TagBackPreview from "./preview/TagBackPreview";
import { CollectionModelPreview } from "./preview/CollectionModelPreview";

export default function StudioPreviewPanel() {
  const { studio, setView } = useStudio();
  const reducedMotion = useReducedMotion();
  const isBack = studio.frontBackView === "back";
  const colourName = findStudioLabel(studioColours, studio.colour, "Selected finish");
  const allowsPetName = designAllowsPetName(studio.collection, studio.design);
  const previewDesign = studioPreviewDesignId(studio.design);
  const previousCollection = useRef(studio.collection);
  const [isCollectionChanging, setIsCollectionChanging] = useState(false);

  useEffect(() => {
    if (previousCollection.current === studio.collection) return;
    previousCollection.current = studio.collection;
    setIsCollectionChanging(true);
    const timeout = window.setTimeout(() => setIsCollectionChanging(false), 180);
    return () => window.clearTimeout(timeout);
  }, [studio.collection]);

  return <Card variant="surface" className="overflow-hidden border-black/[0.07] bg-white shadow-[0_20px_55px_rgba(17,17,17,0.07)]">
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#ffffff_0%,#f5f5f4_48%,#e8e8e5_100%)] px-4 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[43%] size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${studio.colour}1f` }} />
      <div aria-hidden="true" className="absolute bottom-[12%] left-1/2 h-8 w-[62%] -translate-x-1/2 rounded-full bg-black/15 blur-2xl" />
      <div className="relative flex min-h-[350px] items-center justify-center sm:min-h-[440px] xl:min-h-[520px]" role="img" aria-label={`${isBack ? "Back" : "Front"} view of a ${colourName} ${allowsPetName && studio.petName ? `PetTap for ${studio.petName}` : "PetTap"}`}>
        <AnimatePresence mode="wait" initial={false}>
          {isCollectionChanging ? <motion.div key="collection-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex size-full items-center justify-center"><Skeleton className="size-64 rounded-full sm:size-80" /></motion.div> : <motion.div key={`${studio.design}-${studio.size}-${studio.colour}-${studio.lineColour}-${studio.petName}-${studio.frontBackView}`} initial={reducedMotion ? false : { opacity: 0, scale: 0.975, rotateY: isBack ? -82 : 82, rotateZ: -1.4, filter: "blur(2px)" }} animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0, filter: "blur(0px)" }} exit={reducedMotion ? undefined : { opacity: 0, scale: 0.982, rotateY: isBack ? 82 : -82, rotateZ: 1.2, filter: "blur(2px)" }} whileHover={reducedMotion ? undefined : { scale: 1.025, y: -4 }} transition={{ duration: reducedMotion ? 0 : 0.46, ease: premiumEase }} className="[perspective:1000px] [transform-style:preserve-3d]">
            {isBack ? <TagBackPreview colour={studio.colour} design={previewDesign} size={studio.size} /> : <CollectionModelPreview accentColour={studio.lineColour} collection={studio.collection} design={studio.design} petName={studio.petName} primaryColour={studio.colour} size={studio.size} />}
          </motion.div>}
        </AnimatePresence>
      </div>
    </div>
    <div className="flex items-center justify-between gap-4 border-t border-black/[0.06] px-5 py-4 sm:px-6">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Live preview</p><p className="mt-1 text-sm font-medium text-neutral-800">{colourName} · {studio.size}</p></div>
      <div className="flex rounded-xl border border-black/[0.08] bg-neutral-50 p-1" role="group" aria-label="Preview side">
        <Button type="button" size="sm" variant={isBack ? "ghost" : "secondary"} onClick={() => setView("front")}>Front</Button>
        <Button type="button" size="sm" variant={isBack ? "secondary" : "ghost"} onClick={() => setView("back")} leftIcon={<ScanLine className="size-3.5" />}>Back</Button>
      </div>
    </div>
  </Card>;
}
