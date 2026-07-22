export interface ComingSoonProductColour {
  id: "black" | "white" | "blue" | "pink";
  name: string;
  image: string;
  swatch: string;
  imageClassName?: string;
}

/**
 * Product imagery is intentionally isolated from the gallery interaction so
 * launch renders can be replaced with production photography without changing
 * the UI behaviour.
 */
export const COMING_SOON_PRODUCT_COLOURS: readonly ComingSoonProductColour[] = [
  {
    id: "black",
    name: "Black",
    image: "/images/tag/black.png?v=transparent-20260722",
    swatch: "#171717",
  },
  {
    id: "white",
    name: "White",
    image: "/images/tag/silver.png?v=transparent-20260722",
    swatch: "#F7F7F5",
  },
  {
    id: "blue",
    name: "Blue",
    image: "/images/tag/blue.png?v=transparent-20260722",
    swatch: "#2F6CCB",
  },
  {
    id: "pink",
    name: "Pink",
    image: "/images/tag/purple.png?v=transparent-20260722",
    swatch: "#D98FA6",
    imageClassName: "hue-rotate-[-32deg] saturate-[0.76]",
  },
];
