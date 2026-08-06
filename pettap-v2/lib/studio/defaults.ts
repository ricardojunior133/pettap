import { DEFAULT_CONFIGURATION } from "@/src/lib/domain/tag";

import type { StudioConfiguration } from "./types";

export const initialStudioConfiguration: StudioConfiguration = {
  ...DEFAULT_CONFIGURATION,
  collection: "essential",
  design: "circle",
  currentStep: 1,
  frontBackView: "front",
};
