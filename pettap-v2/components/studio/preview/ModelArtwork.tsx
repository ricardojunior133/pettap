import { useId } from "react";

import { cn } from "@/lib/utils";

type VectorModelDefinition = {
  label: string;
  silhouette: "round" | "bone" | "heart" | "shield" | "hexagon" | "arch" | "peak";
};

/**
 * Canonical, recolourable front-preview definitions. These deliberately model the
 * approved tag silhouettes and relief compositions rather than recolouring the
 * photographic product renders used in Step 2.
 */
export const studioPreviewDefinitions: Readonly<Record<string, VectorModelDefinition>> = {
  "essential-round": { label: "Round", silhouette: "round" },
  "essential-bone": { label: "Bone", silhouette: "bone" },
  "essential-heart": { label: "Heart", silhouette: "heart" },
  "essential-shield": { label: "Shield", silhouette: "shield" },
  "essential-hexagon": { label: "Hexagon", silhouette: "hexagon" },
  "nature-tree-of-life": { label: "Tree of Life", silhouette: "round" },
  "nature-forest": { label: "Forest", silhouette: "round" },
  "nature-mountain": { label: "Mountain", silhouette: "shield" },
  "nature-bamboo": { label: "Bamboo", silhouette: "arch" },
  "nature-wave-circle": { label: "Wave Circle", silhouette: "round" },
  "bloom-lotus": { label: "Lotus Flower", silhouette: "round" },
  "bloom-sunflower": { label: "Sunflower", silhouette: "round" },
  "bloom-daisy": { label: "Daisy Flower", silhouette: "round" },
  "bloom-rose": { label: "Rose Outline", silhouette: "round" },
  "bloom-clover": { label: "Clover", silhouette: "round" },
  "cosmic-crescent-moon": { label: "Crescent Moon", silhouette: "round" },
  "cosmic-saturn": { label: "Saturn", silhouette: "round" },
  "cosmic-stars": { label: "Stars", silhouette: "round" },
  "cosmic-rocket": { label: "Rocket", silhouette: "round" },
  "cosmic-comet": { label: "Comet", silhouette: "round" },
  "adventure-compass": { label: "Compass", silhouette: "round" },
  "adventure-trail-sign": { label: "Trail Sign", silhouette: "arch" },
  "adventure-peak": { label: "Peak", silhouette: "peak" },
  "adventure-campfire": { label: "Campfire", silhouette: "shield" },
  "adventure-paw-print": { label: "Paw Print", silhouette: "round" },
  "animal-dog-face": { label: "Dog Face", silhouette: "round" },
  "animal-cat-face": { label: "Cat Face", silhouette: "round" },
  "animal-pug-face": { label: "Pug Face", silhouette: "round" },
  "animal-french-bulldog": { label: "French Bulldog", silhouette: "round" },
  "animal-paw-heart": { label: "Paw Heart", silhouette: "heart" },
};

const silhouettes = {
  round: <path d="M256 90a38 38 0 0 0-37 38v27a176 176 0 1 0 74 0v-27a38 38 0 0 0-37-38Zm0 24a14 14 0 1 1 0 28 14 14 0 0 1 0-28Z" />,
  bone: <path d="M134 160c-32-32-85-9-85 36 0 36 34 58 67 45l24 24-24 24c-13-13-30-19-48-15-45 10-53 69-12 89 22 11 47 4 60-13l29 29c16 16 42 16 58 0l29-29c13 17 38 24 60 13 41-20 33-79-12-89-18-4-35 2-48 15l-24-24 24-24c33 13 67-9 67-45 0-45-53-68-85-36l-27-27c-16-16-42-16-58 0l-27 27Z" />,
  heart: <path d="M256 423 95 262c-64-64-3-171 80-133 34 15 54 52 81 80 27-28 47-65 81-80 83-38 144 69 80 133L256 423Z" />,
  shield: <path d="M256 91a42 42 0 0 0-41 41v24l-122 48v116c0 78 67 112 163 151 96-39 163-73 163-151V204l-122-48v-24a42 42 0 0 0-41-41Zm0 25a16 16 0 1 1 0 32 16 16 0 0 1 0-32Z" />,
  hexagon: <path d="M256 83a39 39 0 0 0-38 38v24l-112 65a39 39 0 0 0-19 33v131a39 39 0 0 0 19 33l112 65a39 39 0 0 0 38 0l112-65a39 39 0 0 0 19-33V243a39 39 0 0 0-19-33l-112-65v-24a39 39 0 0 0-38-38Zm0 25a14 14 0 1 1 0 28 14 14 0 0 1 0-28Z" />,
  arch: <path d="M136 93h240v62h16c24 0 43 19 43 43v202c0 32-26 58-58 58H135c-32 0-58-26-58-58V198c0-24 19-43 43-43h16V93Zm120 21a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z" />,
  peak: <path d="M256 58 427 237v171c0 28-23 51-51 51H136c-28 0-51-23-51-51V237L256 58Zm0 42a15 15 0 1 0 0 30 15 15 0 0 0 0-30Z" />,
} as const;

const star = "M0-23 5-7 22-7 9 3 14 20 0 10-14 20-9 3-22-7-5-7Z";

function Paw({ x = 256, y = 250, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><ellipse cx="0" cy="18" rx="36" ry="31" /><ellipse cx="-43" cy="-16" rx="15" ry="21" /><ellipse cx="-15" cy="-43" rx="15" ry="21" /><ellipse cx="15" cy="-43" rx="15" ry="21" /><ellipse cx="43" cy="-16" rx="15" ry="21" /></g>;
}

function designFor(modelId: string) {
  switch (modelId) {
    case "essential-round": return <Paw />;
    case "essential-bone": return <Paw scale={0.85} />;
    case "essential-heart": return <Paw scale={0.82} />;
    case "essential-shield": return <><path d="M256 172 319 197v58c0 42-28 68-63 85-35-17-63-43-63-85v-58l63-25Z" /><Paw y={252} scale={0.53} /></>;
    case "essential-hexagon": return <Paw scale={0.92} />;
    case "nature-tree-of-life": return <><path d="M256 159v166M256 195c-46-57-102-23-75 13-55-9-62 63 0 55-29 38 14 67 50 34m25-102c46-57 102-23 75 13 55-9 62 63 0 55 29 38-14 67-50 34" /><path d="M156 342c56-35 144-35 200 0" /></>;
    case "nature-forest": return <><path d="M145 324h222M176 324l34-106 34 106m-30-66 22-76 22 76m27 66 35-126 35 126m-26-73 20-68 20 68" /></>;
    case "nature-mountain": return <><path d="m132 335 84-126 46 62 39-49 80 113H132Z" /><path d="m216 209 22 34 22-34m41 13 24 33 22-33" /></>;
    case "nature-bamboo": return <><path d="M194 331V179m46 152V164m47 167V192" /><path d="m194 220-38-31m38 69-37-28m83-23 39-33m-39 73 38-27m49-17 36-29m-36 73 35-28" /></>;
    case "nature-wave-circle": return <><path d="M146 300c37-92 88-92 114-23 21 56 57 57 106 4M145 334c43-53 84-48 113-7 32 45 72 42 109-5" /></>;
    case "bloom-lotus": return <><path d="M256 334c-64 0-99-34-113-78 48 2 73 26 90 50-34-49-36-96-5-132 21 46 28 78 28 111 0-33 7-65 28-111 31 36 29 83-5 132 17-24 42-48 90-50-14 44-49 78-113 78Z" /></>;
    case "bloom-sunflower": return <><circle cx="256" cy="252" r="42" /><g>{Array.from({ length: 14 }, (_, index) => <ellipse key={index} cx="256" cy="166" rx="17" ry="48" transform={`rotate(${index * (360 / 14)} 256 252)`} />)}</g></>;
    case "bloom-daisy": return <><circle cx="256" cy="252" r="31" /><g>{Array.from({ length: 12 }, (_, index) => <ellipse key={index} cx="256" cy="178" rx="16" ry="39" transform={`rotate(${index * 30} 256 252)`} />)}</g></>;
    case "bloom-rose": return <><path d="M256 334c-46-39-65-86-38-136 20-36 62-45 78-13 16-32 58-23 78 13 27 50 8 97-38 136m-80-90c-28 2-39 29-22 45 17 17 42 2 43-18 2-35-36-48-58-27m57 27c8-36 62-31 58 5-3 28-42 29-55 7" /></>;
    case "bloom-clover": return <><path d="M256 332c-25-44-77-25-77-72 0-43 52-58 77-10 25-48 77-33 77 10 0 47-52 28-77 72Z" /><path d="M256 332c0 24-12 39-29 51" /></>;
    case "cosmic-crescent-moon": return <><path d="M291 166c-81 17-101 122-32 166 41 26 89 8 109-27-24 64-107 91-160 40-61-60-30-165 53-180 10-2 20-1 30 1Z" /><path d={star} transform="translate(345 195) scale(.55)" /><path d={star} transform="translate(359 253) scale(.34)" /></>;
    case "cosmic-saturn": return <><ellipse cx="256" cy="245" rx="65" ry="57" /><path d="M147 267c53-42 166-65 222-20 13 10 10 22-4 30-60 37-163 33-218 6-14-7-14-8 0-16Z" /></>;
    case "cosmic-stars": return <>{[[202, 206, 1], [288, 184, .72], [337, 252, .62], [181, 285, .55], [260, 276, .78]].map(([x, y, scale], index) => <path key={index} d={star} transform={`translate(${x} ${y}) scale(${scale})`} />)}</>;
    case "cosmic-rocket": return <><path d="M223 315c-3-69 23-130 79-157 30 48 17 108-34 154l-45 3Z" /><path d="m223 285-41 17 25-45m61 55 26 39-50-16" /><circle cx="266" cy="224" r="16" /></>;
    case "cosmic-comet": return <><path d="M185 305c35-69 92-105 163-114-33 37-59 79-71 128-34 17-63 14-92-14Z" /><path d="M193 264c-31 3-48-6-66-22m84-8c-37-12-49-28-60-47" /><path d={star} transform="translate(352 174) scale(.5)" /></>;
    case "adventure-compass": return <><circle cx="256" cy="249" r="79" /><path d="m256 160 24 70 66 19-66 20-24 70-24-70-66-20 66-19 24-70Z" /><path d="M256 144v18m0 174v18m-105-105h18m174 0h18" /></>;
    case "adventure-trail-sign": return <><path d="M250 175v151" /><path d="m250 192 93 0-24 29 24 29h-93m0 24h-83l24 29-24 29h83" /><path d="M151 343h210" /></>;
    case "adventure-peak": return <><path d="m138 334 99-134 38 47 36-66 73 153H138Z" /><path d="m237 200 20 27 18-27m36-19 18 35 19-35" /></>;
    case "adventure-campfire": return <><path d="M256 333c-49-25-55-69-22-101 6 29 20 39 31 3 8-26 31-35 43-57 29 65 4 103-21 115 19-44-5-58-14-29-5 18-12 31-17 69Z" /><path d="m173 342 154-61m-145 0 145 61" /></>;
    case "adventure-paw-print": return <Paw scale={1.18} />;
    case "animal-dog-face": return <><path d="M194 220c-39-48-68-3-44 47m162-47c39-48 68-3 44 47" /><circle cx="222" cy="252" r="8" /><circle cx="290" cy="252" r="8" /><path d="M256 273c-18 0-22 16 0 24 22-8 18-24 0-24Zm0 24v20m-30 0c16 15 44 15 60 0" /></>;
    case "animal-cat-face": return <><path d="m190 215 22-43 36 34h16l36-34 22 43v82c-18 39-107 39-125 0v-82Z" /><circle cx="226" cy="251" r="7" /><circle cx="286" cy="251" r="7" /><path d="M256 270c-15 0-18 13 0 20 18-7 15-20 0-20Zm0 20v18m-58-20h36m44 0h36" /></>;
    case "animal-pug-face": return <><path d="M194 220c-34-41-63 3-34 48m152-48c34-41 63 3 34 48" /><circle cx="224" cy="249" r="8" /><circle cx="288" cy="249" r="8" /><path d="M226 277c15-20 45-20 60 0 0 31-60 31-60 0Z" /><path d="M256 277v19" /></>;
    case "animal-french-bulldog": return <><path d="m201 218-4-58 47 40h24l47-40-4 58v80c-18 37-92 37-110 0v-80Z" /><circle cx="226" cy="248" r="8" /><circle cx="286" cy="248" r="8" /><path d="M256 270c-18 0-20 15 0 22 20-7 18-22 0-22Zm0 22v19" /></>;
    case "animal-paw-heart": return <Paw scale={1.02} />;
    default: return null;
  }
}

export function hasStudioPreviewDefinition(modelId: string) {
  return modelId in studioPreviewDefinitions;
}

export function ModelArtwork({ modelId, primaryColour, accentColour, petName = "", className }: { modelId: string; primaryColour: string; accentColour: string; petName?: string; className?: string }) {
  const definition = studioPreviewDefinitions[modelId];
  const instanceId = useId().replace(/:/g, "");
  if (!definition) return null;
  const silhouette = silhouettes[definition.silhouette];
  const artwork = designFor(modelId);
  const nameFontSize = petName.length > 9 ? 22 : petName.length > 6 ? 26 : 31;
  const clipPathId = `tag-clip-${instanceId}`;
  const shadowId = `tag-shadow-${instanceId}`;

  return <svg aria-label={`${definition.label} tag artwork`} className={cn("overflow-visible drop-shadow-[0_24px_22px_rgba(17,17,17,0.22)]", className)} data-model-artwork={modelId} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id={clipPathId}>{silhouette}</clipPath>
      <filter id={shadowId} x="-20%" y="-20%" width="140%" height="145%"><feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#111111" floodOpacity="0.3" /></filter>
    </defs>
    <g data-layer="extrusion" fill="#111111" opacity="0.3" transform="translate(0 13)">{silhouette}</g>
    <g filter={`url(#${shadowId})`}>
      <g data-layer="primary" fill={primaryColour} stroke="rgba(17,17,17,0.48)" strokeWidth="5">{silhouette}</g>
      <g clipPath={`url(#${clipPathId})`} data-layer="petg-texture" fill="none" opacity="0.2" stroke="#ffffff" strokeWidth="2">
        {Array.from({ length: 74 }, (_, index) => <path d={`M64 ${152 + index * 4.2}H448`} key={index} />)}
      </g>
      <g data-layer="rim" fill="none" opacity="0.28" stroke="#ffffff" strokeWidth="4">{silhouette}</g>
      <g data-layer="relief-shadow" fill="none" opacity="0.32" stroke="#111111" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" transform="translate(0 5)">{artwork}</g>
      <g data-layer="accent" fill="none" stroke={accentColour} strokeLinecap="round" strokeLinejoin="round" strokeWidth="12">
        <g data-model-relief="true">{artwork}</g>
      </g>
      <g data-layer="relief-highlight" fill="none" opacity="0.22" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" transform="translate(0 -1)">{artwork}</g>
      {petName ? <g aria-label={`Personalised name ${petName}`} data-pet-name="true" textAnchor="middle">
        <text fill="rgba(17,17,17,0.45)" fontSize={nameFontSize} fontWeight="800" letterSpacing="2.5" stroke={primaryColour} strokeWidth="8" x="256" y="389">{petName}</text>
        <text fill={accentColour} fontSize={nameFontSize} fontWeight="800" letterSpacing="2.5" stroke="rgba(255,255,255,0.28)" strokeWidth="1" x="256" y="385">{petName}</text>
      </g> : null}
    </g>
  </svg>;
}
