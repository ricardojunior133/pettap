import type { TagDesign as TagDesignId } from "@/types/tag";

export interface TagDesign {
  id: TagDesignId;
  name: string;
  description: string;
  icon: string;
}

export const TAG_DESIGNS: TagDesign[] = [
  { id: "classic-round", name: "Round", description: "Simple and timeless.", icon: "●" },
  { id: "dog-bone", name: "Bone", description: "A playful classic.", icon: "◆" },
  { id: "cat-paw", name: "Paw", description: "A warm little signature.", icon: "✦" },
  { id: "heart", name: "Heart", description: "Made for the ones we love.", icon: "♥" },
  { id: "shield", name: "Shield", description: "Built for adventure.", icon: "⬟" },
  { id: "hexagon", name: "Hexagon", description: "Clean geometry, made modern.", icon: "⬡" },
  { id: "military", name: "Military", description: "A bold, utilitarian profile.", icon: "▭" },
  { id: "premium", name: "Premium", description: "Softly sculpted and refined.", icon: "✦" },
  { id: "luxury", name: "Luxury", description: "An expressive, elevated silhouette.", icon: "◇" },
];
