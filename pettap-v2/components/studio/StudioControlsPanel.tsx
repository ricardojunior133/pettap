"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { premiumEase } from "@/lib/theme/motion";
import {
  hasStudioColourContrastWarning,
  modelsForStudioCollection,
  studioCollections,
  studioColours,
  studioFinishes,
  studioLineColours,
  studioMaterials,
  studioSizes,
} from "@/lib/studio/options";
import { cn } from "@/lib/utils";

import StudioCollectionCarousel from "./StudioCollectionCarousel";
import { useStudio } from "./StudioContext";

function OptionButton({ active, children, ...props }: React.ComponentPropsWithoutRef<"button"> & { active: boolean }) {
  return <button type="button" aria-pressed={active} className={cn("rounded-2xl border p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 active:scale-[0.99]", active ? "border-neutral-950 bg-neutral-950 text-white shadow-[0_12px_28px_rgba(17,17,17,0.16)]" : "border-black/[0.08] bg-white text-neutral-900 hover:border-black/20 hover:shadow-sm", props.className)} {...props}>{children}</button>;
}

export default function StudioControlsPanel() {
  const { studio, updateStudio } = useStudio();
  const reducedMotion = useReducedMotion();

  return <Card variant="surface" className="overflow-hidden border-black/[0.07] p-6 shadow-[0_14px_40px_rgba(17,17,17,0.045)] sm:p-8">
    <AnimatePresence mode="wait" initial={false}>
      <motion.section key={studio.currentStep} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: premiumEase }} aria-labelledby={`studio-step-${studio.currentStep}`}>
        {studio.currentStep === 1 ? <CollectionStep studio={studio} onUpdate={updateStudio} /> : null}
        {studio.currentStep === 2 ? <DesignStep studio={studio} onUpdate={updateStudio} /> : null}
        {studio.currentStep === 3 ? <PersonaliseStep studio={studio} onUpdate={updateStudio} /> : null}
        {studio.currentStep === 4 ? <ReviewStep studio={studio} /> : null}
      </motion.section>
    </AnimatePresence>
  </Card>;
}

type StudioProps = ReturnType<typeof useStudio>["studio"];
type UpdateStudio = ReturnType<typeof useStudio>["updateStudio"];

function StepIntro({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="mb-7"><Badge variant="neutral">Step {number}</Badge><h1 id={`studio-step-${number}`} className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-4xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-base">{description}</p></div>;
}

function CollectionStep({ studio, onUpdate }: { studio: StudioProps; onUpdate: UpdateStudio }) {
  return <><StepIntro number="1" title="Choose a collection" description="Six distinct worlds, each with five considered designs." />
    <StudioCollectionCarousel selectedId={studio.collection} onSelect={(collection) => {
      const firstModel = modelsForStudioCollection(collection)[0];
      if (firstModel) onUpdate({ collection, design: firstModel.id, season: undefined });
    }} />
  </>;
}

function DesignStep({ studio, onUpdate }: { studio: StudioProps; onUpdate: UpdateStudio }) {
  const { setStep } = useStudio();
  const collection = studioCollections.find((item) => item.id === studio.collection);
  const models = modelsForStudioCollection(studio.collection, studio.season);

  return <><StepIntro number="2" title="Choose a design" description="Pick one of the five designs in your selected collection." />
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-neutral-50 p-3">
      <div className="size-12 overflow-hidden rounded-xl" style={{ backgroundColor: collection?.accent }}><Image alt="" aria-hidden="true" className="size-full object-cover" height={96} src={collection?.coverImage ?? "/images/collections/cards/essential.webp"} width={96} /></div>
      <div><p className="text-xs font-medium text-neutral-500">Selected collection</p><p className="text-sm font-semibold text-neutral-950">{collection?.title ?? "Essential"}</p></div>
    </div>
    <fieldset><legend className="text-sm font-semibold text-neutral-900">Collection designs</legend><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{models.map((item) => <OptionButton key={item.id} active={studio.design === item.id} onClick={() => onUpdate({ design: item.id })}><Image alt="" aria-hidden="true" className="mx-auto aspect-square w-20 object-contain" height={96} onError={(event) => { event.currentTarget.src = item.fallbackImage; }} src={item.image} width={96} /><span className="mt-3 block text-sm font-semibold">{item.name}</span></OptionButton>)}</div></fieldset>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.07] bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Want another direction? Your current collection stays selected.</p><Button type="button" variant="secondary" size="sm" onClick={() => setStep(1)}>Back to collections</Button></div>
  </>;
}

function ColourOptions({ label, colours, value, onChange }: { label: string; colours: readonly { title: string; value: string }[]; value: string; onChange: (value: string) => void }) {
  return <fieldset className="mt-6"><legend className="text-sm font-semibold text-neutral-900">{label}</legend><div className="mt-3 flex flex-wrap gap-3">{colours.map((item) => { const active = value === item.value; return <button key={item.value} type="button" onClick={() => onChange(item.value)} aria-pressed={active} aria-label={`Choose ${label.toLowerCase()} ${item.title}`} className={cn("flex min-h-12 items-center gap-3 rounded-2xl border px-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15", active ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.08] bg-white hover:border-black/20")}><span className="size-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: item.value }} /><span className="text-sm font-medium">{item.title}</span></button>; })}</div></fieldset>;
}

function PersonaliseStep({ studio, onUpdate }: { studio: StudioProps; onUpdate: UpdateStudio }) {
  const hasError = studio.petName.trim().length === 0;
  const sameColour = hasStudioColourContrastWarning(studio.colour, studio.lineColour);

  return <><StepIntro number="3" title="Personalise your PetTap" description="Choose colour, fit and finishing details. Your live preview keeps both sides in view." />
    <label htmlFor="studio-pet-name" className="text-sm font-semibold text-neutral-900">What&apos;s your pet&apos;s name?</label><input id="studio-pet-name" value={studio.petName} onChange={(event) => onUpdate({ petName: event.target.value.slice(0, 12) })} maxLength={12} aria-describedby="studio-name-help studio-name-validation" className="mt-3 min-h-14 w-full rounded-2xl border border-black/[0.10] bg-white px-5 text-base font-medium text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/[0.06]" placeholder="Charlie" /><div className="mt-2 flex justify-between gap-4 text-xs"><p id="studio-name-help" className="text-neutral-500">Up to 12 characters. This is required before review.</p><span className="shrink-0 text-neutral-500">{studio.petName.length}/12</span></div><p id="studio-name-validation" role={hasError ? "status" : undefined} className={cn("mt-5 rounded-2xl px-4 py-3 text-sm leading-6", hasError ? "border border-amber-200 bg-amber-50 text-amber-900" : "border border-emerald-100 bg-emerald-50 text-emerald-800")}>{hasError ? "Add a name before you can review this PetTap." : "Looking good — this name is ready for review."}</p>
    <ColourOptions label="Main colour" colours={studioColours} value={studio.colour} onChange={(colour) => onUpdate({ colour })} />
    <ColourOptions label="Detail colour" colours={studioLineColours} value={studio.lineColour} onChange={(lineColour) => onUpdate({ lineColour })} />
    {sameColour ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">Main colour and detail colour must be different.</p> : null}
    <fieldset className="mt-8"><legend className="text-sm font-semibold text-neutral-900">Size</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{studioSizes.map((item) => <OptionButton key={item.id} active={studio.size === item.id} onClick={() => onUpdate({ size: item.id })}><span className="block text-sm font-semibold">{item.title}</span><span className={cn("mt-1 block text-xs leading-5", studio.size === item.id ? "text-white/65" : "text-neutral-500")}>{item.description}</span></OptionButton>)}</div></fieldset>
    <fieldset className="mt-8"><legend className="text-sm font-semibold text-neutral-900">Finish</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{studioFinishes.map((item) => <OptionButton key={item.id} active={studio.finish === item.id} onClick={() => onUpdate({ finish: item.id })}><span className="block text-sm font-semibold">{item.title}</span><span className={cn("mt-1 block text-xs leading-5", studio.finish === item.id ? "text-white/65" : "text-neutral-500")}>{item.description}</span></OptionButton>)}</div></fieldset>
    <fieldset className="mt-8"><legend className="text-sm font-semibold text-neutral-900">Material</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{studioMaterials.map((item) => <OptionButton key={item.id} active={studio.material === item.id} onClick={() => onUpdate({ material: item.id })}><span className="block text-sm font-semibold">{item.title}</span><span className={cn("mt-1 block text-xs leading-5", studio.material === item.id ? "text-white/65" : "text-neutral-500")}>{item.description}</span></OptionButton>)}</div></fieldset>
  </>;
}

function ReviewStep({ studio }: { studio: StudioProps }) {
  return <><StepIntro number="4" title="Review your PetTap" description="Everything is ready for secure checkout." />
    <div className="rounded-2xl border border-black/[0.07] bg-neutral-50 p-5 text-sm leading-6 text-neutral-600"><p className="font-semibold text-neutral-950">{`${studio.petName || "Your pet"}'s PetTap`} is ready to continue.</p><p className="mt-2">The next phase will connect this prepared configuration to checkout.</p></div>
  </>;
}
