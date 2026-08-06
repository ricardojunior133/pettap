import { TAG_SPEC, TagSize } from "@/lib/tag-spec";
import type { EngravingFont, EngravingIcon } from "@/src/lib/domain/tag";

import { SHAPES } from "./shapes";
import EssentialTag from "./shapes/EssentialTag";
import { isEssentialShapeId } from "@/lib/studio/essential-shapes";

interface TagPreviewProps {
  size: TagSize;
  colour: string;
  petName: string;
  collection: string | null;
  design?: string | null;
  lineColour?: string;
  engravingFont: EngravingFont;
  engravingIcon: EngravingIcon;
}

export default function TagPreview({
  size,
  colour,
  petName,
  design,
  engravingFont,
  engravingIcon,
  lineColour,
}: TagPreviewProps) {
  const spec = TAG_SPEC[size];

  if (design && isEssentialShapeId(design)) {
    return <EssentialTag diameter={spec.diameter * 6} colour={colour} lineColour={lineColour} petName={petName} engravingFont={engravingFont} engravingIcon={engravingIcon} design={design} />;
  }

  const Shape =
    SHAPES[design ?? "classic-round"] ??
    SHAPES["classic-round"];

  return (
    <Shape
      diameter={spec.diameter * 6}
      colour={colour}
      holeOffset={spec.holeOffset}
      holeDiameter={spec.holeDiameter}
      petName={petName}
      engravingFont={engravingFont}
      engravingIcon={engravingIcon}
    />
  );
}
