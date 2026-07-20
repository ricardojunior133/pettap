export type TagColor = "black" | "silver" | "blue" | "purple";

export interface TagVariant {
  id: TagColor;
  name: string;
  subtitle: string;
  image: string;
  bg: string;
  accent: string;
}

export const TAG_VARIANTS: TagVariant[] = [
  {
    id: "black",
    name: "Midnight Black",
    subtitle: "Elegant. Timeless. Minimal.",
    image: "/images/tag/black.png",
    bg: "#F7F7F8",
    accent: "#1A1A1A"  },

  {
    id: "silver",
    name: "Arctic Silver",
    subtitle: "Modern. Clean. Professional.",
    image: "/images/tag/silver.png",
    bg: "#EFF3F6",
    accent: "#B8BDC5"  },

  {
    id: "blue",
    name: "Ocean Blue",
    subtitle: "Fresh. Calm. Adventurous.",
    image: "/images/tag/blue.png",
    bg: "#EEF8FF",
    accent: "#3B82F6"  },

  {
    id: "purple",
    name: "Sunset Purple",
    subtitle: "Bold. Unique. Beautiful.",
    image: "/images/tag/purple.png",
    bg: "#F8F0FF",
    accent: "#8B5CF6"  },
];