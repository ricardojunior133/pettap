import { COLLECTION_MODELS, findCollectionModel, modelsForCollection, modelsForSeason, type CollectionModel, type SeasonalId } from "@/lib/domain/collections";
import { TAG_SIZES } from "@/lib/sizes";

/**
 * The Studio has a deliberately small, curated first step. These stable IDs
 * are presentation IDs: models continue to use the canonical catalogue IDs
 * so previews and future commerce fulfilment keep the same contract.
 */
export const studioCollections = [
  {
    id: "essential",
    title: "Essential",
    description: "Five timeless shapes, made personal.",
    allowsPetName: true,
    coverImage: "/images/collections/cards/essential.webp",
    accent: "#d9e4ee",
    modelIds: ["circle", "bone", "heart", "shield", "hexagon"],
  },
  {
    id: "nature",
    title: "Nature",
    description: "Quiet forms inspired by the outdoors.",
    allowsPetName: true,
    coverImage: "/images/collections/cards/nature.webp",
    accent: "#dcebdc",
    modelIds: ["nature-tree", "nature-forest", "nature-mountain", "nature-wave", "nature-river"],
  },
  {
    id: "bloom",
    title: "Bloom",
    description: "Soft, joyful designs with a floral spirit.",
    allowsPetName: true,
    coverImage: "/images/collections/cards/celebration.webp",
    accent: "#f4e0e5",
    // These canonical model IDs retain their original `nature-*` asset names.
    // Bloom is the Studio presentation collection; the legacy IDs remain URL-compatible.
    modelIds: ["nature-lotus", "nature-blossom", "nature-leaf", "nature-sun", "nature-cactus"],
  },
  {
    id: "cosmic",
    title: "Cosmic",
    description: "A small universe for every adventure.",
    allowsPetName: true,
    coverImage: "/images/collections/cards/kids.webp",
    accent: "#e4e1f4",
    modelIds: ["kids-rocket", "kids-star", "kids-cloud", "kids-rainbow", "kids-unicorn"],
  },
  {
    id: "adventure",
    title: "Adventure",
    description: "Ready for the places you go together.",
    allowsPetName: true,
    coverImage: "/images/collections/cards/breed.webp",
    accent: "#e9e1d3",
    modelIds: ["breed-labrador", "breed-golden-retriever", "breed-border-collie", "breed-dachshund", "breed-cocker-spaniel"],
  },
  {
    id: "animal",
    title: "Animal",
    description: "A playful tribute to their one-of-a-kind character.",
    allowsPetName: true,
    coverImage: "/images/collections/cards/cat.webp",
    accent: "#dfe9e7",
    modelIds: ["cats-bengal", "cats-maine-coon", "cats-ragdoll", "cats-siamese", "cats-british-shorthair"],
  },
] as const;

export type StudioCollection = (typeof studioCollections)[number];
export type StudioCollectionId = StudioCollection["id"];

/** Canonical Studio catalogue. Home intentionally consumes Essential only. */
export const studioModels = COLLECTION_MODELS;
/** Legacy name retained for existing Studio consumers. */
export const studioShapes = studioModels;

export function isStudioCollectionId(value: string | null | undefined): value is StudioCollectionId {
  return studioCollections.some((collection) => collection.id === value);
}

export function modelsForStudioCollection(collection: string | null, season?: SeasonalId): readonly CollectionModel[] {
  const studioCollection = studioCollections.find((item) => item.id === collection);
  if (studioCollection) {
    return studioCollection.modelIds
      .map((modelId) => COLLECTION_MODELS.find((model) => model.id === modelId))
      .filter((model): model is CollectionModel => model !== undefined);
  }

  return collection === "seasonal" ? modelsForSeason(season) : modelsForCollection(collection);
}

/** Every curated Studio collection accepts a pet name. */
export function collectionAllowsPetName(_collection: string | null) {
  void _collection;
  return true;
}

/** Every Studio model supports a pet name. This must not depend on collection or model IDs. */
export function designAllowsPetName(_collection: string | null, _design: string) {
  void _collection;
  void _design;
  return true;
}

export function findStudioModel(collection: string | null, design: string) {
  return modelsForStudioCollection(collection).find((model) => model.id === design) ?? findCollectionModel(collection, design);
}

export function hasStudioColourContrastWarning(primaryColour: string, accentColour: string) {
  return primaryColour.toLowerCase() === accentColour.toLowerCase();
}

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
export const studioFinishes = [
  { id: "matte" as const, title: "Matte", description: "Soft, understated and made for every day." },
  { id: "gloss" as const, title: "Gloss", description: "A subtle light-catching finish." },
] as const;

export function findStudioLabel<T extends { id?: string; title?: string; name?: string; value?: string }>(items: readonly T[], value: string, fallback: string) {
  const item = items.find((candidate) => candidate.id === value || candidate.value === value);
  return item?.title ?? item?.name ?? fallback;
}
