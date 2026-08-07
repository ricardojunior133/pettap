import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { homeCollections } from "@/components/coming-soon/collectionsData";
import { modelsForHomeCollection, showcaseColourPairs } from "@/components/coming-soon/AnimatedCollectionCard";
import { HOME_HERO_ALT, HOME_HERO_IMAGE } from "@/components/coming-soon/homeAssets";
import { productAccentColours, productPrimaryColours, productShapes } from "@/components/coming-soon/productShowcaseOptions";
import { resolveStudioCollection, resolveStudioInitialConfiguration } from "@/lib/studio/collection-query";

describe("PetTap Home collection discovery", () => {
  it("uses the final pet Hero asset with descriptive animal alt text", () => {
    expect(HOME_HERO_IMAGE).toBe("/images/home/pettap-hero-pets.webp");
    expect(HOME_HERO_ALT).toMatch(/Golden Retriever/i);
    expect(HOME_HERO_ALT).toMatch(/cat/i);
    expect(HOME_HERO_ALT).toMatch(/Pug/i);
    expect(existsSync(join(process.cwd(), "public", HOME_HERO_IMAGE))).toBe(true);
  });

  it("shows only the eight official Home collection entries in the intended order", () => {
    expect(homeCollections.map((collection) => collection.id)).toEqual([
      "essential", "breed", "cat", "nature", "luxury", "kids", "celebration", "seasonal",
    ]);
    expect(homeCollections.map((collection) => collection.title)).not.toContain("Christmas Collection");
    expect(homeCollections.map((collection) => collection.title)).not.toContain("Halloween Collection");
    expect(homeCollections.map((collection) => collection.title)).not.toContain("Easter Collection");
    for (const collection of homeCollections) {
      expect(collection.href).toBe(`/studio?collection=${collection.id}`);
      expect(existsSync(join(process.cwd(), "public", collection.image))).toBe(true);
    }
  });

  it("maps public aliases safely into canonical Studio collections and defaults invalid values", () => {
    expect(resolveStudioCollection("essential")).toBe("essential");
    expect(resolveStudioCollection("cat")).toBe("cats");
    expect(resolveStudioCollection("seasonal")).toBe("seasonal");
    expect(resolveStudioCollection("not-a-collection")).toBeUndefined();
  });

  it("derives animated card models from the canonical catalogue, including all seasonal models", () => {
    expect(modelsForHomeCollection("essential")).toHaveLength(20);
    expect(modelsForHomeCollection("breed")).toHaveLength(10);
    expect(modelsForHomeCollection("cat")).toHaveLength(10);
    expect(modelsForHomeCollection("seasonal").map((model) => model.season)).toEqual(expect.arrayContaining(["christmas", "halloween", "easter"]));
    expect(modelsForHomeCollection("seasonal")).toHaveLength(30);
  });

  it("keeps each animated colour pair contrasting and restores the current card selection in Studio", () => {
    expect(showcaseColourPairs.every((pair) => pair.primaryColour !== pair.accentColour)).toBe(true);
    expect(resolveStudioInitialConfiguration({ collection: "breed", model: "breed-pug", primaryColour: "#2563EB", accentColour: "#F5F5F5" })).toEqual({ collection: "breed", design: "breed-pug", colour: "#2563EB", lineColour: "#F5F5F5" });
    expect(resolveStudioInitialConfiguration({ collection: "seasonal", season: "halloween", model: "halloween-pumpkin", primaryColour: "not-a-colour" })).toMatchObject({ collection: "seasonal", season: "halloween", design: "halloween-pumpkin", colour: undefined });
    expect(resolveStudioInitialConfiguration({ collection: "bad", model: "bad" })).toMatchObject({ collection: "essential", design: "essential-round" });
  });

  it("keeps the Home customiser Essential-only with two colour systems", () => {
    expect(productShapes).toEqual(["Round", "Bone", "Heart", "Paw", "Shield", "Star"]);
    expect(productPrimaryColours.length).toBeGreaterThan(1);
    expect(productAccentColours.length).toBeGreaterThan(1);
  });

  it("provides a distinct stable photo for each How It Works step", () => {
    const stepImages = [
      "step-01-pettap-on-collar.webp", "step-02-pet-found.webp", "step-03-tap-nfc-tag.webp",
      "step-04-secure-profile.webp", "step-05-contact-owner.webp", "step-06-safe-reunion.webp",
    ];
    expect(new Set(stepImages).size).toBe(6);
    for (const image of stepImages) expect(existsSync(join(process.cwd(), "public", "images", "how-it-works", image))).toBe(true);
  });

  it("uses dedicated NFC-scan and secure-profile assets with descriptive alt text", () => {
    const source = readFileSync(join(process.cwd(), "components", "coming-soon", "HowPetTapWorks.tsx"), "utf8");

    expect(source).toContain('image: "/images/how-it-works/step-03-tap-nfc-tag.webp"');
    expect(source).toContain("Man holding a smartphone close to the PetTap NFC tag on a pug's collar.");
    expect(source).toContain('image: "/images/how-it-works/step-04-secure-profile.webp"');
    expect(source).toContain("Hand holding a smartphone displaying the secure PetTap profile of a pug named Charlie.");
  });
});
