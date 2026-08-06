"use client";

import { Check } from "lucide-react";

import { studioSteps } from "@/lib/studio/steps";
import { cn } from "@/lib/utils";

import { useStudio } from "./StudioContext";

export default function StudioProgress() {
  const { studio, setStep } = useStudio();

  return (
    <nav aria-label="Studio progress" className="overflow-x-auto pb-1">
      <ol className="mx-auto flex min-w-max max-w-5xl items-start justify-center gap-2 px-6 sm:gap-4 lg:px-8">
        {studioSteps.map((step) => {
          const current = studio.currentStep === step.id;
          const complete = studio.currentStep > step.id;
          const available = step.id <= studio.currentStep;

          return <li key={step.id} className="flex items-center gap-2 sm:gap-3">
            <button type="button" disabled={!available} aria-current={current ? "step" : undefined} onClick={() => setStep(step.id)} className={cn("flex min-h-11 items-center gap-2 rounded-xl px-2 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/15 disabled:cursor-not-allowed", current ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-500", available && !current && "hover:text-neutral-950")}>
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold", current ? "border-neutral-950 bg-neutral-950 text-white" : complete ? "border-neutral-950 bg-neutral-950 text-white" : "border-black/[0.12] bg-white text-neutral-500")}>{complete ? <Check className="size-3.5" aria-hidden="true" /> : step.id}</span>
              <span className="hidden sm:block"><span className="block text-xs font-semibold">{step.title}</span><span className="mt-0.5 block text-[10px] text-neutral-500">{step.description}</span></span>
            </button>
            {step.id < studioSteps.length ? <span aria-hidden="true" className="h-px w-5 bg-black/[0.10] sm:w-10" /> : null}
          </li>;
        })}
      </ol>
    </nav>
  );
}
