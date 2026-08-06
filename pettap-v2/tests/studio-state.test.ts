import { describe, expect, it } from "vitest";

import { initialStudioConfiguration } from "@/lib/studio/defaults";
import { modelsForStudioCollection, studioCollections } from "@/lib/studio/options";
import { resolveStudioInitialConfiguration } from "@/lib/studio/collection-query";
import { canContinueStudio, studioReducer } from "@/lib/studio/state";
import { createInitialStudioConfiguration } from "@/components/studio/StudioContext";

describe("public Studio state", () => {
  it("starts with safe local defaults", () => {
    expect(initialStudioConfiguration).toMatchObject({ collection: "essential", design: "circle", size: "classic", colour: "#111111", petName: "", finish: "matte", frontBackView: "front", currentStep: 1 });
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

  it("blocks review until a pet name is present", () => {
    const atSize = { ...initialStudioConfiguration, currentStep: 3 as const };
    expect(canContinueStudio(atSize)).toBe(false);
    expect(studioReducer(atSize, { type: "next" }).currentStep).toBe(3);
  });

  it("allows review after a pet name is supplied", () => {
    const atSize = { ...initialStudioConfiguration, petName: "Luna", currentStep: 3 as const };
    expect(studioReducer(atSize, { type: "next" }).currentStep).toBe(4);
  });

  it("preserves the pet name when moving between collections", () => {
    const next = studioReducer({ ...initialStudioConfiguration, petName: "Luna" }, { type: "update", payload: { collection: "breed", design: "breed-pug" } });
    expect(next.petName).toBe("Luna");
  });

  it("requires a pet name before every collection design can advance", () => {
    const atSize = { ...initialStudioConfiguration, collection: "breed", design: "breed-pug", petName: "", currentStep: 3 as const };
    expect(studioReducer(atSize, { type: "next" }).currentStep).toBe(3);
  });

  it("changes between front and back views and resets safely", () => {
    const back = studioReducer({ ...initialStudioConfiguration, petName: "Milo" }, { type: "set-view", view: "back" });
    expect(back.frontBackView).toBe("back");
    expect(back.petName).toBe("Milo");
    expect(studioReducer(back, { type: "reset" })).toEqual(initialStudioConfiguration);
  });

  it("keeps six visible Studio collections with five stable designs each", () => {
    expect(studioCollections.map((collection) => collection.title)).toEqual(["Essential", "Nature", "Bloom", "Cosmic", "Adventure", "Animal"]);
    for (const collection of studioCollections) {
      expect(modelsForStudioCollection(collection.id)).toHaveLength(5);
      expect(collection.coverImage).toMatch(/^\/images\/collections\/cards\//);
    }
  });

  it("preserves compatible choices when moving between collections", () => {
    const next = studioReducer(
      { ...initialStudioConfiguration, colour: "#2563EB", lineColour: "#C99B45", size: "explorer", petName: "Luna" },
      { type: "update", payload: { collection: "nature", design: "nature-tree" } },
    );

    expect(next).toMatchObject({ collection: "nature", design: "nature-tree", colour: "#2563EB", lineColour: "#C99B45", size: "explorer", petName: "Luna" });
  });

  it("preserves the pet name when changing models and returning between steps", () => {
    const selected = { ...initialStudioConfiguration, collection: "bloom", design: "nature-lotus", petName: "Milo", currentStep: 2 as const };
    const changedModel = studioReducer(selected, { type: "update", payload: { design: "nature-blossom" } });
    const returned = studioReducer(studioReducer(changedModel, { type: "set-step", step: 1 }), { type: "next" });

    expect(returned).toMatchObject({ collection: "bloom", design: "nature-blossom", petName: "Milo", currentStep: 2 });
  });

  it("restores a selected Studio collection and its model from the URL", () => {
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-lotus" })).toMatchObject({ collection: "bloom", design: "nature-lotus" });
  });

  it("preserves the curated collection when its model uses a legacy catalogue ID", () => {
    const configuration = createInitialStudioConfiguration(
      resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-lotus" }),
    );

    expect(configuration).toMatchObject({ collection: "bloom", design: "nature-lotus" });
  });

  it("restores a supplied pet name with the selected collection and model", () => {
    const configuration = createInitialStudioConfiguration({ collection: "animal", design: "cats-bengal", petName: "Nala" });
    expect(configuration).toMatchObject({ collection: "animal", design: "cats-bengal", petName: "Nala" });
  });

  it("restores each curated collection to one of its own five models", () => {
    for (const collection of studioCollections) {
      const configuration = resolveStudioInitialConfiguration({ collection: collection.id });
      expect(configuration.collection).toBe(collection.id);
      expect(modelsForStudioCollection(collection.id).map((model) => model.id)).toContain(configuration.design);
    }
  });

  it("uses a safe collection-local fallback for invalid URLs", () => {
    expect(resolveStudioInitialConfiguration({ collection: "bloom", model: "nature-tree" })).toMatchObject({ collection: "bloom", design: "nature-lotus" });
    expect(resolveStudioInitialConfiguration({ collection: "unknown", model: "not-a-model" })).toMatchObject({ collection: "essential", design: "circle" });
    expect(resolveStudioInitialConfiguration({ model: "nature-lotus" })).toMatchObject({ collection: "essential", design: "circle" });
  });

  it("allows returning from design to collection without losing the selection", () => {
    const selected = { ...initialStudioConfiguration, collection: "cosmic", design: "kids-rocket", currentStep: 2 as const };
    expect(studioReducer(selected, { type: "set-step", step: 1 })).toMatchObject({ collection: "cosmic", design: "kids-rocket", currentStep: 1 });
  });
});
