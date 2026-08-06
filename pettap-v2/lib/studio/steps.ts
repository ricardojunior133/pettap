import type { StudioStep } from "./types";

export const studioSteps = [
  { id: 1, title: "Collection", description: "Choose a creative world" },
  { id: 2, title: "Design", description: "Pick one of five designs" },
  { id: 3, title: "Personalise", description: "Colour, size and details" },
  { id: 4, title: "Review", description: "Check every detail" },
] as const satisfies readonly { id: StudioStep; title: string; description: string }[];
