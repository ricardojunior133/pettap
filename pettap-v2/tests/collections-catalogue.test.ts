import { describe, expect, it } from "vitest";

import { COLLECTION_MODELS, COLLECTIONS, findCollectionModel, modelsForCollection, modelsForSeason } from "@/lib/domain/collections";
import { designAllowsPetName, modelsForStudioCollection, studioCollections } from "@/lib/studio/options";

const expectedCounts = { essential: 20, breed: 10, cats: 10, nature: 10, luxury: 10, kids: 10, celebration: 20, seasonal: 30 } as const;

describe("PetTap collections catalogue", () => {
  it("contains every collection and its expected set of models", () => {
    expect(COLLECTIONS.map((collection) => collection.id)).toEqual(Object.keys(expectedCounts));
    for (const [collection, count] of Object.entries(expectedCounts)) expect(modelsForCollection(collection)).toHaveLength(count);
    expect(COLLECTION_MODELS).toHaveLength(120);
    expect(new Set(COLLECTION_MODELS.map((model) => model.id)).size).toBe(120);
    expect(modelsForSeason("christmas")).toHaveLength(10);
    expect(modelsForSeason("halloween")).toHaveLength(10);
    expect(modelsForSeason("easter")).toHaveLength(10);
  });

  it("keeps stable, individually replaceable image paths", () => {
    expect(findCollectionModel("breed", "breed-pug")?.image).toBe("/images/collections/breed/pug.png");
    expect(findCollectionModel("cats", "cats-maine-coon")?.image).toBe("/images/collections/cats/maine-coon.png");
    expect(findCollectionModel("celebration", "celebration-forever")?.image).toBe("/images/collections/celebration/forever.png");
  });

  it("declares every catalogue model and every Studio collection personalisable by name", () => {
    expect(COLLECTION_MODELS.every((model) => model.supportsPersonalisation && model.supportsName)).toBe(true);
    for (const collection of studioCollections) {
      for (const model of modelsForStudioCollection(collection.id)) {
        expect(designAllowsPetName(collection.id, model.id)).toBe(true);
      }
    }
  });
});
