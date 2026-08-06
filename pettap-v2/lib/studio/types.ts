import type { PetTagConfiguration } from "@/types/tag";

/** Public Studio commerce state stays local until checkout integration is approved. */
export type StudioStep = 1 | 2 | 3 | 4;
export type StudioView = "front" | "back";

export interface StudioConfiguration extends PetTagConfiguration {
  currentStep: StudioStep;
  frontBackView: StudioView;
}

export type StudioAction =
  | { type: "update"; payload: Partial<PetTagConfiguration> }
  | { type: "set-view"; view: StudioView }
  | { type: "set-step"; step: StudioStep }
  | { type: "next" }
  | { type: "back" }
  | { type: "reset" };
