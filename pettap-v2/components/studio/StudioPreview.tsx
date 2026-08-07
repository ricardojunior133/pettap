"use client";

import { useState } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { Check } from "lucide-react";

import { useStudio } from "./StudioContext";
import TagPreview from "./preview/TagPreview";
import TagBackPreview from "./preview/TagBackPreview";
import { studioPreviewDesignId } from "@/lib/studio/options";

import StudioCard from "@/components/pettap/StudioCard";

const PRODUCT_VIEWS = {
  front: { label: "Front", caption: "Front view", rotateY: 0, rotate: 0, scale: 1, x: 0 },
  angled: { label: "45°", caption: "Angled view", rotateY: -18, rotate: -2, scale: 0.94, x: -4 },
  side: { label: "Side", caption: "Side profile", rotateY: -44, rotate: 0, scale: 0.88, x: -10 },
  back: { label: "Back", caption: "Back view", rotateY: 180, rotate: 0, scale: 1, x: 0 },
} as const;

type ProductView = keyof typeof PRODUCT_VIEWS;

const PRODUCT_BENEFITS = [
  "Waterproof",
  "NFC technology",
  "No subscription",
  "Lightweight",
  "Designed & made in the UK",
];

export default function StudioPreview() {
  const { studio } = useStudio();
  const previewDesign = studioPreviewDesignId(studio.design);
  const [activeView, setActiveView] = useState<ProductView>("front");
  const previewKey = `${studio.design}-${studio.size}-${studio.colour}-${studio.collection ?? "classic"}-${studio.material}-${studio.finish}-${activeView}`;
  const view = PRODUCT_VIEWS[activeView];
  const rotateX = useSpring(0, { stiffness: 110, damping: 20, mass: 0.7 });
  const rotateY = useSpring(0, { stiffness: 110, damping: 20, mass: 0.7 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    rotateX.set(-y * 4);
    rotateY.set(x * 4);
  }

  return (
    <div className="space-y-4 xl:sticky xl:top-28">
      <StudioCard
        size={studio.size}
        colour={studio.colour}
        collection={studio.collection}
        petName={studio.petName}
      >
        <motion.div
          style={{ rotateX, rotateY }}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            rotateX.set(0);
            rotateY.set(0);
          }}
          className="[perspective:900px] [transform-style:preserve-3d]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={previewKey}
              initial={{ opacity: 0, scale: 0.96, y: 6, rotateY: activeView === "back" ? 90 : -90 }}
              animate={{ opacity: 1, scale: view.scale, x: view.x, y: 0, rotate: view.rotate, rotateY: view.rotateY }}
              exit={{ opacity: 0, scale: 1.015, y: -3, rotateY: activeView === "back" ? 90 : -90 }}
              transition={{ type: "spring", stiffness: 190, damping: 25, mass: 0.85 }}
              className={`will-change-transform [transform-style:preserve-3d] ${studio.finish === "gloss" ? "drop-shadow-[0_14px_20px_rgba(255,255,255,0.35)]" : ""}`}
            >
              {activeView === "back" ? (
                <TagBackPreview size={studio.size} colour={studio.colour} design={previewDesign} />
              ) : activeView === "side" ? (
                <SideProfile colour={studio.colour} size={studio.size} />
              ) : (
                <TagPreview
                  size={studio.size}
                  colour={studio.colour}
                  petName={studio.petName}
                  collection={studio.collection}
                  design={previewDesign}
                  engravingFont={studio.engravingFont}
                  engravingIcon={studio.engravingIcon}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </StudioCard>

      <div className="grid grid-cols-3 gap-2.5" aria-label="Product gallery views">
        {(Object.keys(PRODUCT_VIEWS) as ProductView[]).map((viewId) => {
          const option = PRODUCT_VIEWS[viewId];
          const active = activeView === viewId;

          return (
            <button
              key={viewId}
              type="button"
              onClick={() => setActiveView(viewId)}
              className={`rounded-2xl border p-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 active:scale-[0.98] ${active ? "border-black bg-white shadow-sm" : "border-black/[0.07] bg-white/70 hover:border-black/20 hover:bg-white"}`}
              aria-pressed={active}
            >
              <span className="flex h-11 items-center justify-center rounded-xl bg-neutral-100/80">
                <span
                  className="h-7 w-7 rounded-full border border-black/10 shadow-sm transition-transform duration-300"
                  style={{ backgroundColor: studio.colour, transform: `perspective(80px) rotateY(${option.rotateY}deg) rotate(${option.rotate}deg) scale(${option.scale})` }}
                />
              </span>
              <span className="mt-2 block text-xs font-medium text-neutral-900">{option.label}</span>
              <span className="mt-0.5 block text-[11px] text-neutral-400">{option.caption}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Crafted for everyday life</p>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
          {PRODUCT_BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-xs text-neutral-600">
              <Check className="size-3 text-neutral-800" strokeWidth={2.2} aria-hidden="true" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SideProfile({ colour, size }: { colour: string; size: "petite" | "classic" | "explorer" }) {
  const width = { petite: 88, classic: 112, explorer: 136 }[size];

  return (
    <div className="relative h-28 w-44 [perspective:500px]">
      <div className="absolute left-1/2 top-1/2 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/10 blur-xl" style={{ width }} />
      <div className="absolute left-1/2 top-1/2 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/20" style={{ width, backgroundColor: colour, boxShadow: `0 7px 0 ${colour}99, 0 10px 14px rgba(0,0,0,0.16)` }} />
      <div className="absolute left-1/2 top-[calc(50%-7px)] h-2 -translate-x-1/2 rounded-full bg-white/15" style={{ width: width - 10 }} />
    </div>
  );
}
