export interface TagFinish {
  name: string;
  value: string;
  description: string;
}

/**
 * The available colours are intentionally material-led: they represent
 * matte PETG finishes that can be made consistently, not digital effects.
 */
export const TAG_FINISHES: TagFinish[] = [
  { name: "Midnight", value: "#111111", description: "Elegant matte black." },
  { name: "Snow", value: "#F5F5F5", description: "Minimal white." },
  { name: "Ocean", value: "#2563EB", description: "Fresh blue." },
  { name: "Forest", value: "#166534", description: "Inspired by woodland adventures." },
  { name: "Blossom", value: "#B76E79", description: "Soft pastel pink." },
  { name: "Crimson", value: "#B42318", description: "Bold red." },
  { name: "Violet", value: "#7C3AED", description: "Confident violet with a calm matte finish." },
  { name: "Sunshine", value: "#EAB308", description: "Warm yellow made to stand out on every walk." },
  { name: "Tangerine", value: "#EA580C", description: "A bright, playful orange." },
  { name: "Lilac", value: "#A78BFA", description: "A soft, understated purple." },
];

export const FINISH_NAME_BY_VALUE = Object.fromEntries(
  TAG_FINISHES.map((finish) => [finish.value, finish.name])
);
