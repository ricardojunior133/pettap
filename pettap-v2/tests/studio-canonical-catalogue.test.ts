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
    expect(Object.keys(legacyStudioModelAliases)).toEqual(["circle", "bone", "heart", "shield", "hexagon", "nature-tree", "nature-forest", "nature-mountain", "nature-wave", "nature-lotus", "kids-star", "kids-rocket"]);
    expect(Object.values(legacyStudioModelAliases).every((id) => studioModels.some((model) => model.id === id))).toBe(true);
    expect(resolveStudioModelId("nature-lotus")).toBe("bloom-lotus");
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-lotus" })).toMatchObject({ collection: "bloom", design: "bloom-lotus" });
  });

  it.each([
    ["essential", "essential-round"], ["nature", "nature-tree-of-life"], ["bloom", "bloom-lotus"],
    ["cosmic", "cosmic-saturn"], ["adventure", "adventure-trail-sign"], ["animal", "animal-dog-face"],
  ])("restores canonical URL %s/%s", (collection, model) => {
    expect(resolveStudioInitialConfiguration({ collection, model })).toMatchObject({ collection, design: model });
  });

  it("matches the approved final IDs and provides one unique extracted asset per active model", () => {
    expect(studioModels.map((model) => model.id)).toEqual([
      "essential-round", "essential-bone", "essential-heart", "essential-shield", "essential-hexagon",
      "nature-tree-of-life", "nature-forest", "nature-mountain", "nature-bamboo", "nature-wave-circle",
      "bloom-lotus", "bloom-sunflower", "bloom-daisy", "bloom-rose", "bloom-clover",
      "cosmic-crescent-moon", "cosmic-saturn", "cosmic-stars", "cosmic-rocket", "cosmic-comet",
      "adventure-compass", "adventure-trail-sign", "adventure-peak", "adventure-campfire", "adventure-paw-print",
      "animal-dog-face", "animal-cat-face", "animal-pug-face", "animal-french-bulldog", "animal-paw-heart",
    ]);
    expect(studioModels.map((model) => model.image).every((asset) => /^\/studio\/models\/[a-z-]+\/[a-z-]+\.png$/.test(asset))).toBe(true);
    expect(new Set(studioModels.map((model) => model.image)).size).toBe(30);
    for (const model of studioModels) expect(existsSync(join(process.cwd(), "public", model.image))).toBe(true);
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "public", "studio", "models", "manifest.json"), "utf8")) as Record<string, string>;
    expect(manifest).toEqual(Object.fromEntries(studioModels.map((model) => [model.id, model.image])));
    expect(["cosmic-planet", "cosmic-star", "cosmic-starry-sky", "adventure-anchor-shield", "adventure-tent", "adventure-sunrise-mountains", "adventure-paper-boat", "animal-puppy-face", "animal-kitty-face", "animal-butterfly", "animal-whale", "animal-bee"].every((id) => !studioModels.some((model) => model.id === id))).toBe(true);
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
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
