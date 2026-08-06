import { ESSENTIAL_SHAPES } from "@/lib/studio/essential-shapes";

import type { CollectionModel } from "./types";
import { COLLECTION_COLOURS, COLLECTION_SIZES } from "./types";

export const essentialCollection: CollectionModel[] = ESSENTIAL_SHAPES.map((shape) => ({
  id: shape.id,
  slug: shape.id,
  name: shape.name,
  collection: "essential",
  artwork: `/artwork/collections/essential/${shape.id}.svg`,
  productImage: `/images/collections/essential/${shape.id}.png`,
  image: `/images/collections/essential/${shape.id}.png`,
  supportsPersonalisation: true,
  supportsName: true,
  supportsPrimaryColour: true,
  supportsAccentColour: true,
  availableSizes: COLLECTION_SIZES,
  availableColours: COLLECTION_COLOURS,
  order: shape.order,
}));
