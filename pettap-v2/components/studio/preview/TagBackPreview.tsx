import { TAG_SPEC, TagSize } from "@/lib/tag-spec";
import type { TagDesign } from "@/types/tag";
import { getTagOutline } from "./shapes/SignatureTag";
import EssentialTag from "./shapes/EssentialTag";
import { isEssentialShapeId } from "@/lib/studio/essential-shapes";

interface TagBackPreviewProps {
  size: TagSize;
  colour: string;
  design: TagDesign;
}

export default function TagBackPreview({ size, colour, design }: TagBackPreviewProps) {
  const spec = TAG_SPEC[size];
  const diameter = spec.diameter * 6;
  if (isEssentialShapeId(design)) return <EssentialTag colour={colour} design={design} diameter={diameter} engravingFont="classic" engravingIcon="none" petName="" side="back" />;
  const shape = getTagOutline(design, diameter);
  const textColour = colour === "#111111" ? "#ffffff" : "#111111";

  return (
    <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} className="[transform:scaleX(-1)]">
      <path d={shape} fill="#000" opacity="0.1" transform="translate(0 6)" />
      <path d={shape} fill="#000" opacity="0.12" transform="translate(0 3)" />
      <path d={shape} fill={colour} stroke="rgba(17,17,17,0.18)" strokeWidth="2" />
      <path d={shape} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
      <circle cx={diameter / 2} cy={spec.holeOffset * 6} r={(spec.holeDiameter * 6) / 2 + 2} fill="#000" opacity="0.14" />
      <circle cx={diameter / 2} cy={spec.holeOffset * 6} r={(spec.holeDiameter * 6) / 2} fill="#f7f7f5" />
      <text x="50%" y="43%" textAnchor="middle" fontSize={diameter * 0.09} fontWeight="700" fill="#000" opacity="0.18">PetTap</text>
      <text x="50%" y="42.4%" textAnchor="middle" fontSize={diameter * 0.09} fontWeight="700" fill={textColour} opacity="0.58">PetTap</text>
      <g fill="none" stroke={textColour} strokeWidth="1.4" opacity="0.42">
        <path d={`M ${diameter * 0.39} ${diameter * 0.56} q ${diameter * 0.07} ${-diameter * 0.06} 0 ${-diameter * 0.12}`} />
        <path d={`M ${diameter * 0.45} ${diameter * 0.58} q ${diameter * 0.1} ${-diameter * 0.09} 0 ${-diameter * 0.18}`} />
        <path d={`M ${diameter * 0.51} ${diameter * 0.6} q ${diameter * 0.13} ${-diameter * 0.12} 0 ${-diameter * 0.24}`} />
      </g>
      <text x="50%" y="69%" textAnchor="middle" fontSize={diameter * 0.05} fontWeight="600" fill={textColour} opacity="0.48">TAP TO CONNECT</text>
    </svg>
  );
}
