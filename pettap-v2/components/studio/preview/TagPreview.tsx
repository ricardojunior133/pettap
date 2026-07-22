import { TAG_SPEC, TagSize } from "@/lib/tag-spec";
import type { EngravingFont, EngravingIcon } from "@/src/lib/domain/tag";

import { SHAPES } from "./shapes";

interface TagPreviewProps {
  size: TagSize;
  colour: string;
  petName: string;
  collection: string | null;
  design?: keyof typeof SHAPES | null;
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
}: TagPreviewProps) {
  const spec = TAG_SPEC[size];

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
