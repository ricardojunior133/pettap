import type { TagDesign } from "@/types/tag";

export const ESSENTIAL_SHAPES = [
  { id: "circle", name: "Circle", order: 1 }, { id: "square", name: "Square", order: 2 }, { id: "rounded-square", name: "Rounded Square", order: 3 }, { id: "oval", name: "Oval", order: 4 }, { id: "teardrop", name: "Teardrop", order: 5 },
  { id: "bone", name: "Bone", order: 6 }, { id: "heart", name: "Heart", order: 7 }, { id: "paw", name: "Paw", order: 8 }, { id: "shield", name: "Shield", order: 9 }, { id: "star", name: "Star", order: 10 },
  { id: "hexagon", name: "Hexagon", order: 11 }, { id: "triangle", name: "Triangle", order: 12 }, { id: "home", name: "Home", order: 13 }, { id: "cat", name: "Cat", order: 14 }, { id: "cloud", name: "Cloud", order: 15 },
  { id: "diamond", name: "Diamond", order: 16 }, { id: "flower", name: "Flower", order: 17 }, { id: "bear", name: "Bear", order: 18 }, { id: "crescent-moon", name: "Crescent Moon", order: 19 }, { id: "lightning-bolt", name: "Lightning Bolt", order: 20 },
] as const satisfies ReadonlyArray<{ id: TagDesign; name: string; order: number }>;

export type EssentialShapeId = (typeof ESSENTIAL_SHAPES)[number]["id"];

export function isEssentialShapeId(value: string): value is EssentialShapeId {
  return ESSENTIAL_SHAPES.some((shape) => shape.id === value);
}

export function essentialShapeImage(id: EssentialShapeId) {
  return `/images/tag-shapes/essential/${id}.png`;
}
