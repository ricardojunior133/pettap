import { describe, expect, it } from "vitest";

import { createInitialStudioConfiguration } from "@/components/studio/StudioContext";
import { resolveStudioInitialConfiguration } from "@/lib/studio/collection-query";
import { initialStudioConfiguration } from "@/lib/studio/defaults";
import { modelsForStudioCollection, studioCollections } from "@/lib/studio/options";
import { canContinueStudio, studioReducer } from "@/lib/studio/state";

describe("public Studio state", () => {
  it("starts with safe canonical defaults", () => {
    expect(initialStudioConfiguration).toMatchObject({ collection: "essential", design: "essential-round", size: "classic", colour: "#111111", petName: "", finish: "matte", frontBackView: "front", currentStep: 1 });
  });

  it("updates configuration fields without changing the step", () => {
    const next = studioReducer(initialStudioConfiguration, { type: "update", payload: { petName: "Charlie", colour: "#2563EB" } });
    expect(next).toMatchObject({ petName: "Charlie", colour: "#2563EB", currentStep: 1 });
  });

  it("moves forward and back through completed steps", () => {
    const second = studioReducer(initialStudioConfiguration, { type: "next" });
    const third = studioReducer(second, { type: "next" });
    expect(third.currentStep).toBe(3);
    expect(studioReducer(third, { type: "back" }).currentStep).toBe(2);
  });

  it("requires a pet name before every canonical design can advance", () => {
    const atSize = { ...initialStudioConfiguration, collection: "adventure", design: "adventure-compass", currentStep: 3 as const };
    expect(canContinueStudio(atSize)).toBe(false);
    expect(studioReducer(atSize, { type: "next" }).currentStep).toBe(3);
    expect(studioReducer({ ...atSize, petName: "Luna" }, { type: "next" }).currentStep).toBe(4);
  });

  it("preserves the pet name, colours and size when selections and steps change", () => {
    const selected = { ...initialStudioConfiguration, collection: "bloom", design: "bloom-lotus", colour: "#2563EB", lineColour: "#C99B45", size: "explorer" as const, petName: "Milo", currentStep: 2 as const };
    const changedModel = studioReducer(selected, { type: "update", payload: { design: "bloom-sunflower" } });
    const returned = studioReducer(studioReducer(changedModel, { type: "set-step", step: 1 }), { type: "next" });
    expect(returned).toMatchObject({ collection: "bloom", design: "bloom-sunflower", petName: "Milo", colour: "#2563EB", lineColour: "#C99B45", size: "explorer", currentStep: 2 });
  });

  it("keeps six visible Studio collections with five canonical designs each", () => {
    expect(studioCollections.map((collection) => collection.title)).toEqual(["Essential", "Nature", "Bloom", "Cosmic", "Adventure", "Animal"]);
    for (const collection of studioCollections) {
      expect(modelsForStudioCollection(collection.id)).toHaveLength(5);
      expect(modelsForStudioCollection(collection.id).every((model) => model.id.startsWith(`${collection.id}-`))).toBe(true);
      expect(collection.coverImage).toMatch(/^\/images\/collections\/cards\//);
    }
  });

  it("restores canonical URLs and normalises known legacy Studio URLs", () => {
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "bloom-lotus" })).toMatchObject({ collection: "bloom", design: "bloom-lotus" });
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-lotus" })).toMatchObject({ collection: "bloom", design: "bloom-lotus" });
    expect(createInitialStudioConfiguration({ collection: "animal", design: "animal-dog-face", petName: "Nala" })).toMatchObject({ collection: "animal", design: "animal-dog-face", petName: "Nala" });
  });

  it("uses a safe collection-local fallback for invalid URLs", () => {
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-tree" })).toMatchObject({ collection: "bloom", design: "bloom-lotus" });
    expect(resolveStudioInitialConfiguration({ collection: "unknown", model: "not-a-model" })).toMatchObject({ collection: "essential", design: "essential-round" });
  });
});
