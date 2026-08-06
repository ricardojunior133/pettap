import type { TagDesign as TagDesignId } from "@/types/tag";
import { ESSENTIAL_SHAPES, essentialShapeImage } from "@/lib/studio/essential-shapes";

export interface TagDesign {
  id: TagDesignId;
  name: string;
  description: string;
  icon: string;
  image: string;
  collection: "essential";
  allowsPetName: true;
  order: number;
}

export const TAG_DESIGNS: TagDesign[] = ESSENTIAL_SHAPES.map((shape) => ({
  ...shape,
  description: "Essential shape, made personal.",
  icon: "●",
  image: essentialShapeImage(shape.id),
  collection: "essential",
  allowsPetName: true,
}));
