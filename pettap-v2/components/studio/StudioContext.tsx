"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";

import { initialStudioConfiguration } from "@/lib/studio/defaults";
import { modelsForStudioCollection, resolveStudioModelId } from "@/lib/studio/options";
import { canContinueStudio, studioReducer } from "@/lib/studio/state";
import type { StudioConfiguration, StudioStep, StudioView } from "@/lib/studio/types";
import type { PetTagConfiguration } from "@/types/tag";

interface StudioContextType {
  studio: StudioConfiguration;
  updateStudio: (data: Partial<PetTagConfiguration>) => void;
  setView: (view: StudioView) => void;
  setStep: (step: StudioStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canContinue: boolean;
  resetStudio: () => void;
}

type StudioInitialConfiguration = {
  collection?: string;
  design?: string;
  colour?: string;
  lineColour?: string;
  petName?: string;
  season?: "christmas" | "halloween" | "easter";
};

const StudioContext =
  createContext<StudioContextType | null>(null);

export function StudioProvider({
  children,
  initialConfiguration,
}: {
  children: ReactNode;
  initialConfiguration?: StudioInitialConfiguration;
}) {
  const [studio, dispatch] = useReducer(studioReducer, initialConfiguration, createInitialStudioConfiguration);

  function updateStudio(data: Partial<PetTagConfiguration>) { dispatch({ type: "update", payload: data }); }
  function setView(view: StudioView) { dispatch({ type: "set-view", view }); }
  function setStep(step: StudioStep) { dispatch({ type: "set-step", step }); }
  function nextStep() { dispatch({ type: "next" }); }
  function previousStep() { dispatch({ type: "back" }); }
  function resetStudio() { dispatch({ type: "reset" }); }

  const value = useMemo(
    () => ({
      studio,
      updateStudio, setView, setStep, nextStep, previousStep, canContinue: canContinueStudio(studio), resetStudio,
    }),
    [studio]
  );

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);

  if (!context) {
    throw new Error(
      "useStudio must be used inside StudioProvider"
    );
  }

  return context;
}

export function createInitialStudioConfiguration(initialConfiguration?: StudioInitialConfiguration): StudioConfiguration {
  const firstModel = initialConfiguration?.collection ? modelsForStudioCollection(initialConfiguration.collection, initialConfiguration.season)[0] : undefined;

  if (!firstModel) return { ...initialStudioConfiguration };

  return {
    ...initialStudioConfiguration,
    // Keep the curated Studio collection ID. A model can retain a legacy
    // catalogue collection (for example Bloom's `nature-*` assets), but the
    // visual flow and URL must continue to represent the selected Studio card.
    collection: initialConfiguration?.collection ?? null,
    design: resolveStudioModelId(initialConfiguration?.design) ?? initialConfiguration?.design ?? firstModel.id,
    colour: initialConfiguration?.colour ?? initialStudioConfiguration.colour,
    lineColour: initialConfiguration?.lineColour ?? initialStudioConfiguration.lineColour,
    season: initialConfiguration?.collection === "seasonal" ? initialConfiguration.season ?? firstModel.season : undefined,
    petName: initialConfiguration?.petName ?? "",
  };
}
