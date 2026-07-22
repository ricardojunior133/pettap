import type { EngravingFont, EngravingIcon, TagDesign } from "@/types/tag";
import { EngravingIconMark, getEngravingFont, getEngravingFontSize } from "./Engraving";

export interface SignatureTagProps {
  diameter: number; colour: string; holeOffset: number; holeDiameter: number; petName: string;
  engravingFont: EngravingFont; engravingIcon: EngravingIcon; variant: TagDesign;
}

export function getTagOutline(variant: TagDesign, d: number) {
  const c = d / 2;
  const paths: Partial<Record<TagDesign, string>> = {
    "dog-bone": `M ${d*.2} ${d*.28} C ${d*.02} ${d*.08} ${d*.02} ${d*.42} ${d*.24} ${d*.45} H ${d*.76} C ${d*.98} ${d*.42} ${d*.98} ${d*.08} ${d*.8} ${d*.28} C ${d*.65} ${d*.43} ${d*.65} ${d*.57} ${d*.8} ${d*.72} C ${d*.98} ${d*.92} ${d*.98} ${d*.58} ${d*.76} ${d*.55} H ${d*.24} C ${d*.02} ${d*.58} ${d*.02} ${d*.92} ${d*.2} ${d*.72} C ${d*.35} ${d*.57} ${d*.35} ${d*.43} ${d*.2} ${d*.28} Z`,
    "cat-paw": `M ${c} ${d*.94} C ${d*.13} ${d*.88} ${d*.1} ${d*.48} ${d*.3} ${d*.38} C ${d*.08} ${d*.02} ${d*.38} ${d*.0} ${c} ${d*.26} C ${d*.62} ${d*.0} ${d*.92} ${d*.02} ${d*.7} ${d*.38} C ${d*.9} ${d*.48} ${d*.87} ${d*.88} ${c} ${d*.94} Z`,
    heart: `M ${c} ${d*.94} C ${d*.02} ${d*.52} ${d*.17} ${d*.05} ${c} ${d*.28} C ${d*.83} ${d*.05} ${d*.98} ${d*.52} ${c} ${d*.94} Z`,
    shield: `M ${c} ${d*.05} L ${d*.84} ${d*.18} V ${d*.57} C ${d*.84} ${d*.77} ${d*.7} ${d*.91} ${c} ${d*.98} C ${d*.3} ${d*.91} ${d*.16} ${d*.77} ${d*.16} ${d*.57} V ${d*.18} Z`,
    hexagon: `M ${c} ${d*.04} L ${d*.88} ${d*.28} V ${d*.72} L ${c} ${d*.96} L ${d*.12} ${d*.72} V ${d*.28} Z`,
    military: `M ${d*.27} ${d*.06} H ${d*.73} Q ${d*.9} ${d*.06} ${d*.9} ${d*.25} V ${d*.75} Q ${d*.9} ${d*.94} ${d*.73} ${d*.94} H ${d*.27} Q ${d*.1} ${d*.94} ${d*.1} ${d*.75} V ${d*.25} Q ${d*.1} ${d*.06} ${d*.27} ${d*.06} Z`,
    premium: `M ${c} ${d*.04} C ${d*.8} ${d*.04} ${d*.93} ${d*.21} ${d*.93} ${c} C ${d*.93} ${d*.79} ${d*.8} ${d*.96} ${c} ${d*.96} C ${d*.2} ${d*.96} ${d*.07} ${d*.79} ${d*.07} ${c} C ${d*.07} ${d*.21} ${d*.2} ${d*.04} ${c} ${d*.04} Z`,
    luxury: `M ${c} ${d*.04} C ${d*.87} ${d*.04} ${d*.95} ${d*.22} ${d*.8} ${d*.49} C ${d*.71} ${d*.7} ${d*.6} ${d*.87} ${c} ${d*.96} C ${d*.4} ${d*.87} ${d*.29} ${d*.7} ${d*.2} ${d*.49} C ${d*.05} ${d*.22} ${d*.13} ${d*.04} ${c} ${d*.04} Z`,
  };
  return paths[variant] ?? `M ${c} 6 A ${d/2-6} ${d/2-6} 0 1 1 ${c-.01} 6 Z`;
}

export default function SignatureTag({ diameter, colour, holeOffset, holeDiameter, petName, engravingFont, engravingIcon, variant }: SignatureTagProps) {
  const textColour = colour === "#111111" ? "#fff" : "#111";
  const opacity = colour === "#111111" ? .72 : .62;
  const name = petName || "Your Pet";
  const outline = getTagOutline(variant, diameter);
  const holeY = Math.max(holeOffset * 6, diameter * .16);
  const font = getEngravingFont(engravingFont);
  return <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
    <path d={outline} fill="#000" opacity=".1" transform="translate(0 6)" /><path d={outline} fill="#000" opacity=".12" transform="translate(0 3)" />
    <path d={outline} fill={colour} stroke="rgba(17,17,17,.18)" strokeWidth="2" /><path d={outline} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
    <circle cx={diameter/2} cy={holeY+2} r={holeDiameter*3+2} fill="#000" opacity=".14" /><circle cx={diameter/2} cy={holeY} r={holeDiameter*3} fill="#f7f7f5" />
    <text x="50%" y="43.7%" textAnchor="middle" fontSize={diameter*.08} fontWeight="700" fill="#000" opacity=".18">PetTap</text>
    <text x="50%" y="43%" textAnchor="middle" fontSize={diameter*.08} fontWeight="700" fontFamily={font} fill={textColour} opacity={opacity}>PetTap</text>
    <line x1={diameter*.27} x2={diameter*.73} y1={diameter*.5} y2={diameter*.5} stroke={textColour} opacity=".22" />
    <EngravingIconMark icon={engravingIcon} diameter={diameter} y={diameter*.53} colour={textColour} />
    <text x="50%" y="67.2%" textAnchor="middle" fontSize={getEngravingFontSize(diameter,name)} fontWeight="600" fontFamily={font} fill="#000" opacity=".18">{name}</text>
    <text x="50%" y="66.5%" textAnchor="middle" fontSize={getEngravingFontSize(diameter,name)} fontWeight="600" fontFamily={font} fill={textColour} opacity={opacity}>{name}</text>
  </svg>;
}
