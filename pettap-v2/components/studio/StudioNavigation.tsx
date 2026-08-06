"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isStudioConfigurationComplete } from "@/lib/studio/commerce";
import { designAllowsPetName } from "@/lib/studio/options";

import { useStudio } from "./StudioContext";

// Checkout infrastructure is intentionally loaded only after the customer asks
// to continue. The Studio itself remains a local configuration experience.
const StudioCheckoutDialog = dynamic(
  () => import("./StudioCheckoutDialog").then((module) => module.StudioCheckoutDialog),
  { ssr: false },
);

export default function StudioNavigation() {
  const { studio, canContinue, nextStep, previousStep } = useStudio();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const isReview = studio.currentStep === 4;
  const blocked = studio.currentStep === 3 && !canContinue;
  const complete = isStudioConfigurationComplete(studio);
  const allowsPetName = designAllowsPetName(studio.collection, studio.design);

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-5 text-sm text-neutral-600" role="status">
          {blocked
            ? allowsPetName
              ? "Complete every required choice and add your pet's name before review."
              : "Complete every required choice before review."
            : isReview && complete
              ? "Ready for secure checkout."
              : isReview
                ? "Complete the configuration before checkout can continue."
                : null}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" size="lg" disabled={studio.currentStep === 1} onClick={previousStep} leftIcon={<ArrowLeft className="size-4" />}>Back</Button>
          {isReview ? <Button type="button" variant="primary" size="lg" disabled={!complete} onClick={() => setCheckoutOpen(true)} rightIcon={<Check className="size-4" />}>Continue to Checkout</Button> : <Button type="button" variant="primary" size="lg" disabled={!canContinue} onClick={nextStep} rightIcon={<ArrowRight className="size-4" />}>{studio.currentStep === 3 ? "Review configuration" : "Continue"}</Button>}
        </div>
      </div>
      {checkoutOpen ? <StudioCheckoutDialog studio={studio} onClose={() => setCheckoutOpen(false)} /> : null}
    </>
  );
}
