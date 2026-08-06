import { initialStudioConfiguration } from "./defaults";
import { isStudioConfigurationComplete } from "./commerce";
import type { StudioAction, StudioConfiguration, StudioStep } from "./types";

export function canContinueStudio(state: StudioConfiguration) {
  return state.currentStep !== 3 || isStudioConfigurationComplete(state);
}

export function canVisitStep(state: StudioConfiguration, step: StudioStep) {
  return step <= state.currentStep;
}

export function studioReducer(state: StudioConfiguration, action: StudioAction): StudioConfiguration {
  switch (action.type) {
    case "update":
      return { ...state, ...action.payload };
    case "set-view":
      return { ...state, frontBackView: action.view };
    case "set-step":
      return canVisitStep(state, action.step) ? { ...state, currentStep: action.step } : state;
    case "next":
      return state.currentStep < 4 && canContinueStudio(state)
        ? { ...state, currentStep: (state.currentStep + 1) as StudioStep }
        : state;
    case "back":
      return state.currentStep > 1
        ? { ...state, currentStep: (state.currentStep - 1) as StudioStep }
        : state;
    case "reset":
      return { ...initialStudioConfiguration };
  }
}
