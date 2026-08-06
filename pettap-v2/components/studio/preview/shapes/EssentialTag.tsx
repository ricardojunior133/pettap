import { useId } from "react";

import { essentialShapeImage, type EssentialShapeId } from "@/lib/studio/essential-shapes";
import type { EngravingFont, EngravingIcon } from "@/types/tag";

import { EngravingIconMark, getEngravingFont, getEngravingFontSize } from "./Engraving";

export interface EssentialTagProps {
  diameter: number;
  colour: string;
  lineColour?: string;
  petName: string;
  engravingFont: EngravingFont;
  engravingIcon: EngravingIcon;
  design: EssentialShapeId;
  side?: "front" | "back";
}

/** Uses the extracted production silhouette as an alpha mask, so colour stays live. */
export default function EssentialTag({ diameter, colour, lineColour = "#f5f5f5", petName, engravingFont, engravingIcon, design, side = "front" }: EssentialTagProps) {
  const maskId = `essential-shape-${useId().replace(/:/g, "")}`;
  const textColour = colour === "#111111" ? "#ffffff" : "#111111";
  const name = petName.slice(0, 12);
  const font = getEngravingFont(engravingFont);
  const front = side === "front";

  return <svg width={diameter} height={diameter} viewBox="0 0 512 512" role="presentation">
    <defs><mask id={maskId} maskUnits="userSpaceOnUse"><image href={essentialShapeImage(design)} height="512" width="512" /></mask></defs>
    <g mask={`url(#${maskId})`}>
      <rect fill="#000000" height="512" opacity="0.12" transform="translate(0 9)" width="512" />
      <rect fill={colour} height="512" width="512" />
      <rect fill="none" height="508" stroke={lineColour} strokeOpacity="0.5" strokeWidth="6" width="508" x="2" y="2" />
    </g>
    <circle cx="256" cy="105" fill="#000" opacity="0.14" r="23" /><circle cx="256" cy="101" fill="#f7f7f5" r="20" />
    {front ? <>
      <text fill="#000" fontSize="38" fontWeight="700" opacity="0.18" textAnchor="middle" x="256" y="238">PetTap</text>
      <text fill={textColour} fontFamily={font} fontSize="38" fontWeight="700" opacity="0.64" textAnchor="middle" x="256" y="234">PetTap</text>
      <line opacity="0.24" stroke={textColour} strokeWidth="2" x1="166" x2="346" y1="270" y2="270" />
      <EngravingIconMark colour={textColour} diameter={512} icon={engravingIcon} y={288} />
      {name ? <><text fill="#000" fontFamily={font} fontSize={getEngravingFontSize(512, name)} fontWeight="600" opacity="0.18" textAnchor="middle" x="256" y="362">{name}</text><text fill={textColour} fontFamily={font} fontSize={getEngravingFontSize(512, name)} fontWeight="600" opacity="0.68" textAnchor="middle" x="256" y="357">{name}</text></> : null}
    </> : <>
      <text fill={textColour} fontFamily={font} fontSize="42" fontWeight="700" opacity="0.62" textAnchor="middle" x="256" y="238">PetTap</text>
      <g fill="none" opacity="0.48" stroke={textColour} strokeWidth="7"><path d="M 206 306 q 28 -24 0 -48" /><path d="M 234 316 q 42 -34 0 -68" /><path d="M 265 326 q 54 -44 0 -88" /></g>
      <text fill={textColour} fontSize="20" fontWeight="600" letterSpacing="1.5" opacity="0.52" textAnchor="middle" x="256" y="390">TAP TO CONNECT</text>
    </>}
  </svg>;
}
