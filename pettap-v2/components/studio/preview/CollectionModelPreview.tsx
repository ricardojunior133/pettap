import { findStudioModel } from "@/lib/studio/options";
import type { TagSize } from "@/types/tag";

import { ModelArtwork } from "./ModelArtwork";

export function CollectionModelPreview({ collection, design, size, primaryColour, accentColour, petName }: { collection: string | null; design: string; size: TagSize; primaryColour: string; accentColour: string; petName: string }) {
  const model = findStudioModel(collection, design);
  const widthClass = {
    petite: "w-[min(58vw,15rem)] sm:w-[min(38vw,18rem)] xl:w-[min(22vw,18rem)]",
    classic: "w-[min(70vw,18rem)] sm:w-[min(47vw,19rem)] xl:w-[min(27vw,22rem)]",
    explorer: "w-[min(76vw,20rem)] sm:w-[min(50vw,21rem)] xl:w-[min(30vw,22.5rem)]",
  }[size];
  if (!model) return null;
  return <div className={`relative ${widthClass}`}>
    <ModelArtwork accentColour={accentColour} className="h-auto w-full" modelId={model.id} petName={petName} primaryColour={primaryColour} />
  </div>;
}
