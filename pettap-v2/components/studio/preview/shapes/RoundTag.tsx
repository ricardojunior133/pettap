import type { EngravingFont, EngravingIcon } from "@/src/lib/domain/tag";
import { EngravingIconMark, getEngravingFont, getEngravingFontSize } from "./Engraving";

interface RoundTagProps {
  diameter: number;
  colour: string;
  holeOffset: number;
  holeDiameter: number;
  petName: string;
  engravingFont: EngravingFont;
  engravingIcon: EngravingIcon;
}

export default function RoundTag({
  diameter,
  colour,
  holeOffset,
  holeDiameter,
  petName,
  engravingFont,
  engravingIcon,
}: RoundTagProps) {
  const textColour = colour === "#111111" ? "#ffffff" : "#111111";
  const textOpacity = colour === "#111111" ? 0.72 : 0.62;
  const engraving = petName || "Your Pet";
  const nameFontSize = getEngravingFontSize(diameter, engraving);
  const fontFamily = getEngravingFont(engravingFont);

  return (
    <svg
      width={diameter}
      height={diameter}
      viewBox={`0 0 ${diameter} ${diameter}`}
    >
      <circle
        cx={diameter / 2}
        cy={diameter / 2 + 6}
        r={diameter / 2 - 4}
        fill="#000"
        opacity="0.1"
      />

      <circle
        cx={diameter / 2}
        cy={diameter / 2 + 3}
        r={diameter / 2 - 6}
        fill="#000"
        opacity="0.12"
      />

      <circle
        cx={diameter / 2}
        cy={diameter / 2}
        r={diameter / 2 - 6}
        fill={colour}
        stroke="rgba(17,17,17,0.18)"
        strokeWidth="2"
      />

      <circle
        cx={diameter / 2}
        cy={diameter / 2}
        r={diameter / 2 - 18}
        fill="rgba(255,255,255,0.045)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      <circle
        cx={diameter / 2}
        cy={holeOffset * 6}
        r={(holeDiameter * 6) / 2 + 2}
        fill="#000"
        opacity="0.14"
      />
      <circle
        cx={diameter / 2}
        cy={holeOffset * 6}
        r={(holeDiameter * 6) / 2}
        fill="#ffffff"
      />

      <text x="50%" y="40.7%" textAnchor="middle" fontSize={diameter * 0.08} fontWeight="700" fill="#000000" opacity="0.18">
        PetTap
      </text>
      <text
        x="50%"
        y="40%"
        textAnchor="middle"
        fontSize={diameter * 0.08}
        fontWeight="700"
        fill={textColour}
        opacity={textOpacity}
        fontFamily={fontFamily}
      >
        PetTap
      </text>

      <line
        x1={diameter * 0.25}
        x2={diameter * 0.75}
        y1={diameter * 0.48}
        y2={diameter * 0.48}
        stroke={textColour}
        opacity="0.22"
      />

      <EngravingIconMark icon={engravingIcon} diameter={diameter} y={diameter * 0.53} colour={textColour} />

      <text x="50%" y="65.2%" textAnchor="middle" fontSize={nameFontSize} fontWeight="600" fontFamily={fontFamily} fill="#000000" opacity="0.18">
        {engraving}
      </text>
      <text
        x="50%"
        y="64.5%"
        textAnchor="middle"
        fontSize={nameFontSize}
        fontWeight="600"
        fontFamily={fontFamily}
        fill={textColour}
        opacity={textOpacity}
      >
        {engraving}
      </text>
    </svg>
  );
}
