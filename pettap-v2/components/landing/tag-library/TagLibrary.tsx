"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";

import Container from "@/components/layout/Container";
import TagPreview from "@/components/studio/preview/TagPreview";
import { COLLECTIONS } from "@/lib/collections";
import { TAG_DESIGNS } from "@/lib/designs";
import { TAG_FINISHES } from "@/lib/finishes";
import { TAG_SIZES } from "@/lib/sizes";
import type { TagSize } from "@/types/tag";
import { createEssentialPurchase, createOrderDraft, readOrderDraft, saveOrderDraft } from "@/lib/checkout/draft";

const studioShapes = TAG_DESIGNS.slice(0, 4);

export default function TagLibrary() {
  const [finish, setFinish] = useState(TAG_FINISHES[0]);
  const [size, setSize] = useState<TagSize>("classic");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const draft = readOrderDraft();
      const purchase = draft?.purchase;
      if (!purchase || purchase.type !== "essential") return;
      const selectedFinish = TAG_FINISHES.find((item) => item.value === purchase.selection.colour);
      if (selectedFinish) setFinish(selectedFinish);
      setSize(purchase.selection.size);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function saveEssentialDraft() { saveOrderDraft(createOrderDraft(createEssentialPurchase({ colour: finish.value, size, finish: "matte" }))); }

  return (
    <section id="tags" className="scroll-mt-24 bg-white py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">The everyday original</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-5xl">Meet PetTap Essential.</h2>
            <p className="mt-5 text-lg leading-8 text-neutral-600">Ready to activate. Beautifully simple. Designed to help bring pets home safely.</p>
            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-500">PetTap Essential is a complete NFC pet tag. Choose the finish and size that feels right, then activate it when it arrives. No personalisation is required.</p>

            <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
              <TrustPoint text="Ready to use" />
              <TrustPoint text="No personalisation required" />
              <TrustPoint text="Premium PETG" />
              <TrustPoint text="NFC enabled" />
            </div>

            <Link href="/checkout/review" onClick={saveEssentialDraft} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">
              Buy PetTap Essential <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="order-1 overflow-hidden rounded-[32px] border border-black/[0.07] bg-neutral-50/65 p-5 sm:p-8 lg:order-2">
            <div className="relative flex min-h-[290px] items-center justify-center overflow-hidden rounded-[28px] bg-white px-8 py-10">
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/[0.04] blur-[100px]" />
              <div className="relative w-56 transition-transform duration-500 sm:w-64">
                <TagPreview size={size} colour={finish.value} petName="" collection={null} design="classic-round" engravingFont="classic" engravingIcon="none" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Classic round · {finish.name}</p>
                <p className="mt-1 text-sm text-neutral-500">A complete PetTap, ready to activate.</p>
              </div>
              <div className="flex gap-2" role="group" aria-label="Choose an Essential finish">
                {TAG_FINISHES.slice(0, 5).map((option) => {
                  const selected = option.value === finish.value;
                  return <button key={option.value} type="button" onClick={() => setFinish(option)} aria-pressed={selected} aria-label={option.name} title={option.name} className={`size-8 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 ${selected ? "scale-110 border-neutral-950" : "border-white hover:scale-105"}`} style={{ backgroundColor: option.value }} />;
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2" role="group" aria-label="Choose an Essential size">
              {TAG_SIZES.map((option) => {
                const selected = option.id === size;
                return <button key={option.id} type="button" onClick={() => setSize(option.id)} aria-pressed={selected} className={`rounded-xl border px-3 py-2.5 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 ${selected ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.06] bg-white text-neutral-600 hover:border-black/20"}`}><p className="text-xs font-semibold">{option.title}</p><p className={`mt-1 text-[10px] ${selected ? "text-white/60" : "text-neutral-400"}`}>{selected ? "Selected" : "Available"}</p></button>;
              })}
            </div>
          </div>
        </div>

        <div id="studio-preview" className="mt-24 scroll-mt-24 border-t border-black/[0.07] pt-20 sm:mt-32 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">PetTap Studio</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-5xl">Want to make it truly theirs?</h2>
            <p className="mt-5 text-base leading-7 text-neutral-600">Explore the silhouettes and collections, then make every final choice in the dedicated Studio.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {studioShapes.map((design, index) => <article key={design.id} className={`group rounded-[24px] border p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(17,17,17,0.08)] ${index === 0 ? "border-neutral-950 bg-white" : "border-black/[0.07] bg-neutral-50/65"}`}>
              <div className="flex h-32 items-center justify-center rounded-2xl bg-white"><div className="w-24 transition-transform duration-500 group-hover:scale-105"><TagPreview size="classic" colour="#111111" petName="" collection={null} design={design.id} engravingFont="classic" engravingIcon="none" /></div></div>
              <p className="mt-4 text-sm font-semibold text-neutral-950">{design.name}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{design.description}</p>
              {index === 0 && <span className="mt-3 inline-flex rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Signature shape</span>}
            </article>)}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {COLLECTIONS.map((collection, index) => <article key={collection.id} className={`rounded-2xl border p-4 ${index === 0 ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.07] bg-white text-neutral-950"}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${index === 0 ? "text-white/60" : "text-neutral-400"}`}>Collection</p>
              <p className="mt-2 text-sm font-semibold">{collection.name}</p>
              <p className={`mt-1 text-xs leading-5 ${index === 0 ? "text-white/70" : "text-neutral-500"}`}>{collection.description}</p>
            </article>)}
          </div>

          <div className="mt-10 text-center">
            <Link href="/studio" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15">
              Continue to Studio <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function TrustPoint({ text }: { text: string }) {
  return <div className="flex items-center gap-2 text-sm font-medium text-neutral-700"><Check className="size-4 text-neutral-900" aria-hidden="true" />{text}</div>;
}
