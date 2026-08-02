import { cn } from "@/lib/utils";

export interface CollectionArtworkProps {
  artwork: string;
  primaryColour: string;
  accentColour: string;
  className?: string;
}

const motifs = [
  <path key="circle" d="M256 172c-59 0-107 48-107 107s48 107 107 107 107-48 107-107-48-107-107-107Z" />,
  <path key="diamond" d="M256 163 342 249 256 372 170 249 256 163Z" />,
  <path key="wave" d="M154 306c20-101 184-151 204 0-34 73-169 73-204 0Z" />,
  <path key="home" d="M167 344V223l89-69 89 69v121H167Z" />,
  <path key="drop" d="M256 160c45 61 101 81 87 144-11 50-51 83-87 83s-76-33-87-83c-14-63 42-83 87-144Z" />,
] as const;

function artworkIndex(artwork: string) {
  return [...artwork].reduce((total, character) => total + character.charCodeAt(0), 0) % motifs.length;
}

/** Inline two-layer placeholder artwork. Product photography stays separate. */
export function CollectionArtwork({ artwork, primaryColour, accentColour, className }: CollectionArtworkProps) {
  const motif = motifs[artworkIndex(artwork)];
  return <svg aria-hidden="true" className={cn("drop-shadow-[0_16px_18px_rgba(0,0,0,0.18)]", className)} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <g data-layer="primary" fill={primaryColour}>
      <circle cx="256" cy="278" r="171" />
      <circle cx="256" cy="91" r="35" />
    </g>
    <g data-layer="accent" fill="none" stroke={accentColour} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="256" cy="91" r="15" strokeWidth="12" />
      <circle cx="256" cy="278" r="152" strokeWidth="14" />
      <g strokeWidth="14">{motif}</g>
      <path d="M191 402h130" strokeWidth="10" />
    </g>
  </svg>;
}
