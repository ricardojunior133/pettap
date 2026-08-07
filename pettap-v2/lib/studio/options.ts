import { findCollectionModel, modelsForCollection, modelsForSeason, type SeasonalId } from "@/lib/domain/collections";
import { TAG_SIZES } from "@/lib/sizes";

export const studioCollections = [
  { id: "essential", title: "Essential", description: "Five timeless shapes, made personal.", allowsPetName: true, coverImage: "/images/collections/cards/essential.webp", accent: "#d9e4ee" },
  { id: "nature", title: "Nature", description: "Quiet forms inspired by the outdoors.", allowsPetName: true, coverImage: "/images/collections/cards/nature.webp", accent: "#dcebdc" },
  { id: "bloom", title: "Bloom", description: "Soft, joyful designs with a floral spirit.", allowsPetName: true, coverImage: "/images/collections/cards/celebration.webp", accent: "#f4e0e5" },
  { id: "cosmic", title: "Cosmic", description: "A small universe for every adventure.", allowsPetName: true, coverImage: "/images/collections/cards/kids.webp", accent: "#e4e1f4" },
  { id: "adventure", title: "Adventure", description: "Ready for the places you go together.", allowsPetName: true, coverImage: "/images/collections/cards/breed.webp", accent: "#e9e1d3" },
  { id: "animal", title: "Animal", description: "A playful tribute to their one-of-a-kind character.", allowsPetName: true, coverImage: "/images/collections/cards/cat.webp", accent: "#dfe9e7" },
] as const;

export type StudioCollection = (typeof studioCollections)[number];
export type StudioCollectionId = StudioCollection["id"];

export interface StudioModel {
  id: string;
  slug: string;
  name: string;
  collection: StudioCollectionId;
  /** Stable future artwork path. The preview safely falls back until artwork exists. */
  artwork: string;
  /** Stable future product-render path. */
  productImage: string;
  /** Existing legacy render retained only as a visual fallback. */
  image: string;
  supportsPersonalisation: true;
  supportsName: true;
  supportsPrimaryColour: true;
  supportsAccentColour: true;
  supportsSize: true;
  supportsFinish: true;
  season?: SeasonalId;
  availableSizes: readonly ("petite" | "classic" | "explorer")[];
  availableColours: readonly ("black" | "white" | "blue" | "green" | "purple" | "pink" | "orange" | "red")[];
  order: number;
}

const allSizes = ["petite", "classic", "explorer"] as const;
const allColours = ["black", "white", "blue", "green", "purple", "pink", "orange", "red"] as const;

function studioModel(collection: StudioCollectionId, slug: string, name: string, fallbackImage: string, order: number): StudioModel {
  const id = `${collection}-${slug}`;
  return {
    id, slug, name, collection,
    artwork: `/studio/models/${collection}/${slug}.svg`,
    productImage: `/studio/models/${collection}/${slug}.png`,
    image: fallbackImage,
    supportsPersonalisation: true, supportsName: true, supportsPrimaryColour: true, supportsAccentColour: true, supportsSize: true, supportsFinish: true,
    availableSizes: allSizes, availableColours: allColours, order,
  };
}

/** The sole active Studio catalogue. IDs are canonical commerce-facing identifiers. */
export const studioModels: readonly StudioModel[] = [
  studioModel("essential", "round", "Round", "/images/collections/essential/circle.png", 1),
  studioModel("essential", "bone", "Bone", "/images/collections/essential/bone.png", 2),
  studioModel("essential", "heart", "Heart", "/images/collections/essential/heart.png", 3),
  studioModel("essential", "shield", "Shield", "/images/collections/essential/shield.png", 4),
  studioModel("essential", "hexagon", "Hexagon", "/images/collections/essential/hexagon.png", 5),
  studioModel("nature", "tree-of-life", "Tree of Life", "/images/collections/nature/tree.png", 1),
  studioModel("nature", "forest", "Forest", "/images/collections/nature/forest.png", 2),
  studioModel("nature", "mountain", "Mountain", "/images/collections/nature/mountain.png", 3),
  studioModel("nature", "bamboo", "Bamboo", "/images/collections/nature/river.png", 4),
  studioModel("nature", "wave-circle", "Wave Circle", "/images/collections/nature/wave.png", 5),
  studioModel("bloom", "lotus", "Lotus Flower", "/images/collections/nature/lotus.png", 1),
  studioModel("bloom", "sunflower", "Sunflower", "/images/collections/nature/blossom.png", 2),
  studioModel("bloom", "daisy", "Daisy Flower", "/images/collections/nature/leaf.png", 3),
  studioModel("bloom", "rose", "Rose Outline", "/images/collections/nature/sun.png", 4),
  studioModel("bloom", "clover", "Clover", "/images/collections/nature/cactus.png", 5),
  studioModel("cosmic", "crescent-moon", "Crescent Moon", "/images/collections/kids/rocket.png", 1),
  studioModel("cosmic", "planet", "Planet", "/images/collections/kids/star.png", 2),
  studioModel("cosmic", "star", "Star Outline", "/images/collections/kids/cloud.png", 3),
  studioModel("cosmic", "starry-sky", "Starry Sky", "/images/collections/kids/rainbow.png", 4),
  studioModel("cosmic", "comet", "Comet", "/images/collections/kids/unicorn.png", 5),
  studioModel("adventure", "compass", "Compass", "/images/collections/breed/labrador.png", 1),
  studioModel("adventure", "anchor-shield", "Anchor Shield", "/images/collections/breed/golden-retriever.png", 2),
  studioModel("adventure", "tent", "Tent", "/images/collections/breed/border-collie.png", 3),
  studioModel("adventure", "sunrise-mountains", "Sunrise Mountains", "/images/collections/breed/dachshund.png", 4),
  studioModel("adventure", "paper-boat", "Paper Boat", "/images/collections/breed/cocker-spaniel.png", 5),
  studioModel("animal", "puppy-face", "Puppy Face", "/images/collections/cats/bengal.png", 1),
  studioModel("animal", "kitty-face", "Kitty Face", "/images/collections/cats/maine-coon.png", 2),
  studioModel("animal", "butterfly", "Butterfly", "/images/collections/cats/ragdoll.png", 3),
  studioModel("animal", "whale", "Whale", "/images/collections/cats/siamese.png", 4),
  studioModel("animal", "bee", "Bee", "/images/collections/cats/british-shorthair.png", 5),
];

export const legacyStudioModelAliases: Readonly<Record<string, StudioModel["id"]>> = {
  circle: "essential-round", bone: "essential-bone", heart: "essential-heart", shield: "essential-shield", hexagon: "essential-hexagon",
  "nature-tree": "nature-tree-of-life", "nature-forest": "nature-forest", "nature-mountain": "nature-mountain", "nature-river": "nature-bamboo", "nature-wave": "nature-wave-circle",
  "nature-lotus": "bloom-lotus", "nature-blossom": "bloom-sunflower", "nature-leaf": "bloom-daisy", "nature-sun": "bloom-rose", "nature-cactus": "bloom-clover",
  "kids-rocket": "cosmic-crescent-moon", "kids-star": "cosmic-planet", "kids-cloud": "cosmic-star", "kids-rainbow": "cosmic-starry-sky", "kids-unicorn": "cosmic-comet",
  "breed-labrador": "adventure-compass", "breed-golden-retriever": "adventure-anchor-shield", "breed-border-collie": "adventure-tent", "breed-dachshund": "adventure-sunrise-mountains", "breed-cocker-spaniel": "adventure-paper-boat",
  "cats-bengal": "animal-puppy-face", "cats-maine-coon": "animal-kitty-face", "cats-ragdoll": "animal-butterfly", "cats-siamese": "animal-whale", "cats-british-shorthair": "animal-bee",
};

/** Legacy name retained for existing Studio consumers; it now contains only the 30 active models. */
export const studioShapes = studioModels;

export function isStudioCollectionId(value: string | null | undefined): value is StudioCollectionId {
  return studioCollections.some((collection) => collection.id === value);
}

export function resolveStudioModelId(value: string | null | undefined) {
  if (!value) return undefined;
  return legacyStudioModelAliases[value] ?? (studioModels.some((model) => model.id === value) ? value : undefined);
}

export function modelsForStudioCollection(collection: string | null, season?: SeasonalId): readonly StudioModel[] {
  if (isStudioCollectionId(collection)) return studioModels.filter((model) => model.collection === collection);
  // Retain the historical Home/seasonal reader without making it part of the active Studio catalogue.
  return (collection === "seasonal" ? modelsForSeason(season) : modelsForCollection(collection)) as unknown as readonly StudioModel[];
}

/** Every curated Studio collection accepts a pet name. */
export function collectionAllowsPetName(_collection: string | null) { void _collection; return true; }

/** Every Studio model supports a pet name. This must not depend on collection or model IDs. */
export function designAllowsPetName(_collection: string | null, _design: string) { void _collection; void _design; return true; }

export function findStudioModel(collection: string | null, design: string) {
  const canonicalId = resolveStudioModelId(design) ?? design;
  return modelsForStudioCollection(collection).find((model) => model.id === canonicalId) ?? findCollectionModel(collection, canonicalId);
}

export function isCanonicalStudioModel(collection: string | null, design: string) {
  return Boolean(isStudioCollectionId(collection) && findStudioModel(collection, design));
}

/** Preview-only bridge for the existing Essential SVG components. */
export function studioPreviewDesignId(design: string) {
  return ({ "essential-round": "circle", "essential-bone": "bone", "essential-heart": "heart", "essential-shield": "shield", "essential-hexagon": "hexagon" } as Record<string, string>)[design] ?? design;
}

export function hasStudioColourContrastWarning(primaryColour: string, accentColour: string) { return primaryColour.toLowerCase() === accentColour.toLowerCase(); }

export const studioColours = [
  { id: "black", title: "Black", value: "#111111", sku: "BLK" }, { id: "white", title: "White", value: "#F5F5F5", sku: "WHT" },
  { id: "blue", title: "Blue", value: "#2563EB", sku: "BLU" }, { id: "green", title: "Green", value: "#166534", sku: "GRN" },
  { id: "purple", title: "Purple", value: "#7C3AED", sku: "PUR" }, { id: "pink", title: "Pink", value: "#B76E79", sku: "PNK" },
  { id: "orange", title: "Orange", value: "#EA580C", sku: "ORG" }, { id: "red", title: "Red", value: "#B42318", sku: "RED" },
] as const;

export const studioLineColours = [
  { id: "white", title: "White", value: "#F5F5F5", sku: "WHT" }, { id: "silver", title: "Silver", value: "#C7C7CC", sku: "SLV" },
  { id: "gold", title: "Gold", value: "#C99B45", sku: "GLD" }, { id: "black", title: "Black", value: "#111111", sku: "BLK" },
] as const;

export const studioSizes = TAG_SIZES;
export const studioMaterials = [{ id: "PETG" as const, title: "Premium PETG", description: "Durable, lightweight and made for everyday adventures." }];
export const studioFinishes = [{ id: "matte" as const, title: "Matte", description: "Soft, understated and made for every day." }, { id: "gloss" as const, title: "Gloss", description: "A subtle light-catching finish." }] as const;

export function findStudioLabel<T extends { id?: string; title?: string; name?: string; value?: string }>(items: readonly T[], value: string, fallback: string) {
  const item = items.find((candidate) => candidate.id === value || candidate.value === value);
  return item?.title ?? item?.name ?? fallback;
}
