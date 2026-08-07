import { describe, expect, it } from "vitest";

import { resolveStudioInitialConfiguration } from "@/lib/studio/collection-query";
import { legacyStudioModelAliases, modelsForStudioCollection, resolveStudioModelId, studioCollections, studioModels } from "@/lib/studio/options";
import { createGuestCheckoutAttemptSchema } from "@/features/guest-commerce/schemas/guest-checkout";
import { calculateGuestCheckoutConfiguration } from "@/features/guest-commerce/services/guest-checkout-pricing";

describe("canonical 30-model Studio catalogue", () => {
  it("contains six ordered collections with five unique canonical models in each", () => {
    expect(studioCollections.map((collection) => collection.id)).toEqual(["essential", "nature", "bloom", "cosmic", "adventure", "animal"]);
    expect(studioModels).toHaveLength(30);
    expect(new Set(studioModels.map((model) => model.id)).size).toBe(30);
    for (const collection of studioCollections) {
      const models = modelsForStudioCollection(collection.id);
      expect(models).toHaveLength(5);
      expect(models.every((model) => model.id.startsWith(`${collection.id}-`) && model.collection === collection.id)).toBe(true);
    }
  });

  it("declares the full personalisation contract for every active model", () => {
    expect(studioModels.every((model) => model.supportsName && model.supportsPersonalisation && model.supportsPrimaryColour && model.supportsAccentColour && model.supportsSize && model.supportsFinish)).toBe(true);
  });

  it("keeps legacy namespaces out of the active catalogue", () => {
    expect(studioModels.some((model) => model.collection === "bloom" && model.id.startsWith("nature-"))).toBe(false);
    expect(studioModels.some((model) => model.collection === "cosmic" && model.id.startsWith("kids-"))).toBe(false);
    expect(studioModels.some((model) => model.collection === "adventure" && model.id.startsWith("breed-"))).toBe(false);
    expect(studioModels.some((model) => model.collection === "animal" && model.id.startsWith("cats-"))).toBe(false);
  });

  it("normalises every former Studio model ID and preserves the known Bloom URL", () => {
    expect(Object.keys(legacyStudioModelAliases)).toHaveLength(30);
    expect(Object.values(legacyStudioModelAliases).every((id) => studioModels.some((model) => model.id === id))).toBe(true);
    expect(resolveStudioModelId("nature-lotus")).toBe("bloom-lotus");
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-lotus" })).toMatchObject({ collection: "bloom", design: "bloom-lotus" });
  });

  it.each([
    ["essential", "essential-round"], ["nature", "nature-tree-of-life"], ["bloom", "bloom-lotus"],
    ["cosmic", "cosmic-planet"], ["adventure", "adventure-compass"], ["animal", "animal-puppy-face"],
  ])("restores canonical URL %s/%s", (collection, model) => {
    expect(resolveStudioInitialConfiguration({ collection, model })).toMatchObject({ collection, design: model });
  });

  it("keeps the canonical model ID and personalisation in the checkout configuration", () => {
    const input = createGuestCheckoutAttemptSchema.parse({
      configuration: { collection: "bloom", shape: "bloom-lotus", colour: "black", lineColour: "gold", size: "classic", finish: "matte", petName: "Charlie" },
      customer: { email: "customer@example.test", fullName: "Test Customer", shippingAddress: { fullName: "Test Customer", addressLine1: "1 Example Street", city: "London", postcode: "SW1A 1AA", countryCode: "GB" } },
    });
    const checkout = calculateGuestCheckoutConfiguration(input.configuration);
    expect(checkout).toMatchObject({ collection: "bloom", shape: "bloom-lotus", petName: "Charlie", sku: "PET-BLM-BLOOM-LOTUS-CLA-MAT-BLK-GOLD" });
  });
});
