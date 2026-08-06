import { findStudioModel } from "@/lib/studio/options";
import type { TagSize } from "@/types/tag";

import { CollectionArtwork } from "./CollectionArtwork";

export function CollectionModelPreview({ collection, design, size, primaryColour, accentColour, petName }: { collection: string | null; design: string; size: TagSize; primaryColour: string; accentColour: string; petName: string }) {
  const model = findStudioModel(collection, design);
  const widthClass = { petite: "w-44", classic: "w-56", explorer: "w-72" }[size];
  if (!model) return null;
  return <div className={`relative ${widthClass}`}>
    <CollectionArtwork accentColour={accentColour} artwork={model.artwork} className="h-auto w-full" primaryColour={primaryColour} />
    {petName ? <span className="pointer-events-none absolute inset-x-[20%] top-[65%] block truncate text-center text-[clamp(0.7rem,3.6vw,1.15rem)] font-semibold tracking-[0.08em] text-white [text-shadow:0_1px_5px_rgba(0,0,0,0.55)]">{petName}</span> : null}
  </div>;
}
