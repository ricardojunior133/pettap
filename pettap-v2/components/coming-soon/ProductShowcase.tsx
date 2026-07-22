"use client";

import Image from "next/image";
import { type KeyboardEvent, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import {
  COMING_SOON_PRODUCT_COLOURS,
  type ComingSoonProductColour,
} from "./productColours";

export default function ProductShowcase() {
  const [selectedColour, setSelectedColour] = useState<ComingSoonProductColour>(
    COMING_SOON_PRODUCT_COLOURS[0],
  );
  const reducedMotion = useReducedMotion();
  const crossfadeTransition = {
    duration: reducedMotion ? 0 : 0.3,
    ease: "easeInOut" as const,
  };

  function selectColourAt(index: number) {
    const count = COMING_SOON_PRODUCT_COLOURS.length;
    setSelectedColour(COMING_SOON_PRODUCT_COLOURS[(index + count) % count]);
  }

  function handleColourKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectColourAt(index + 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectColourAt(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectColourAt(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectColourAt(COMING_SOON_PRODUCT_COLOURS.length - 1);
    }
  }

  return (
    <section aria-labelledby="product-showcase-title" className="relative z-10 mx-auto max-w-5xl px-6 pb-24 sm:pb-32">
      <h2 id="product-showcase-title" className="sr-only">Choose a PetTap colour</h2>
      <div className="relative mx-auto flex aspect-square w-full max-w-[34rem] items-center justify-center rounded-[44px] border border-white/80 bg-white/75 shadow-[0_30px_90px_rgba(17,17,17,0.08)] sm:rounded-[52px]">
        <div className="absolute inset-12 rounded-full bg-neutral-950/[0.035] blur-3xl" />
        <div className="relative size-full" aria-live="polite">
          <AnimatePresence initial={false}>
            <motion.div
              key={selectedColour.id}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={crossfadeTransition}
            >
              <Image
                src={selectedColour.image}
                alt={`${selectedColour.name} PetTap NFC pet tag`}
                width={460}
                height={460}
                priority
                sizes="(max-width: 640px) 82vw, 460px"
                className={cn(
                  "w-[82%] drop-shadow-[0_28px_30px_rgba(17,17,17,0.24)]",
                  selectedColour.imageClassName,
                )}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-9 text-center">
        <div role="radiogroup" aria-label="Choose your colour" className="flex items-center justify-center gap-4">
          {COMING_SOON_PRODUCT_COLOURS.map((colour, index) => {
            const selected = colour.id === selectedColour.id;

            return (
              <button
                key={colour.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={colour.name}
                onClick={() => setSelectedColour(colour)}
                onKeyDown={(event) => handleColourKeyDown(event, index)}
                tabIndex={selected ? 0 : -1}
                className={cn(
                  "group relative flex size-11 items-center justify-center rounded-full transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 motion-reduce:transition-none",
                  selected ? "ring-1 ring-neutral-950 ring-offset-4" : "ring-1 ring-black/[0.10] ring-offset-2",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-8 rounded-full border border-black/[0.10] shadow-inner"
                  style={{ backgroundColor: colour.swatch }}
                />
                <span className="sr-only">{selected ? `${colour.name}, selected` : colour.name}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-5 text-sm font-medium text-neutral-600">Choose your colour</p>
        <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-neutral-500">Works with most modern iPhone and Android NFC smartphones. No app required.</p>
      </div>
    </section>
  );
}
