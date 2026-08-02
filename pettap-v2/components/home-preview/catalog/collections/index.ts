import { breedCollection } from "./breed";
import { catsCollection } from "./cats";
import { celebrationCollection } from "./celebration";
import { christmasCollection } from "./christmas";
import { easterCollection } from "./easter";
import { essentialCollection } from "./essential";
import { halloweenCollection } from "./halloween";
import { kidsCollection } from "./kids";
import { luxuryCollection } from "./luxury";
import { natureCollection } from "./nature";
import type { CollectionDefinition, CollectionId, CollectionModel, SeasonalId } from "./types";

export * from "./types";

export const COLLECTIONS: readonly CollectionDefinition[] = [
  { id: "essential", title: "Essential", description: "Choose a shape and add their name.", allowsPetName: true },
  { id: "breed", title: "Breed", description: "Inspired by every best friend.", allowsPetName: false },
  { id: "cats", title: "Cats", description: "For feline friends of every kind.", allowsPetName: false },
  { id: "nature", title: "Nature", description: "Inspired by the beauty of nature.", allowsPetName: false },
  { id: "luxury", title: "Luxury", description: "Premium, elegant and exclusive.", allowsPetName: false },
  { id: "kids", title: "Kids", description: "Fun, colourful and playful.", allowsPetName: false },
  { id: "celebration", title: "Celebration", description: "Moments worth celebrating.", allowsPetName: false },
  { id: "seasonal", title: "Seasonal", description: "Limited designs for every season.", allowsPetName: false },
];

export const COLLECTION_MODELS: readonly CollectionModel[] = [
  ...essentialCollection, ...breedCollection, ...catsCollection, ...natureCollection, ...luxuryCollection,
  ...kidsCollection, ...celebrationCollection, ...christmasCollection, ...halloweenCollection, ...easterCollection,
];

export function modelsForCollection(collection: string | null) {
  return COLLECTION_MODELS.filter((model) => model.collection === collection);
}

export function modelsForSeason(season: SeasonalId | null | undefined) {
  return modelsForCollection("seasonal").filter((model) => !season || model.season === season);
}

export function findCollectionModel(collection: string | null, modelId: string) {
  return COLLECTION_MODELS.find((model) => model.collection === collection && model.id === modelId) ?? null;
}

export function isCollectionId(value: string | null): value is CollectionId {
  return COLLECTIONS.some((collection) => collection.id === value);
}

export function isCollectionModel(collection: string, modelId: string) {
  return findCollectionModel(collection, modelId) !== null;
}
