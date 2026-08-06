/** Semantic PetTap colour tokens for components and product surfaces. */
export const colors = {
  ink: "#111111",
  canvas: "#fbfbfa",
  surface: "#ffffff",
  surfaceMuted: "#f8f8f6",
  border: "rgba(17, 17, 17, 0.07)",
  textMuted: "#525252",
  success: "#15803d",
  accent: "#2563eb",
} as const;

export const colorClasses = {
  canvas: "bg-[#fbfbfa]",
  surface: "bg-white",
  ink: "bg-neutral-950 text-white",
  border: "border-black/[0.07]",
  mutedText: "text-neutral-600",
} as const;
