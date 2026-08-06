import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CollectionArtwork } from "@/components/studio/preview/CollectionArtwork";
import { findCollectionModel } from "@/lib/domain/collections";
import { calculateGuestCheckoutConfiguration } from "@/features/guest-commerce/services/guest-checkout-pricing";

const collectionExamples = [
  ["breed", "breed-pug"], ["cats", "cats-bengal"], ["nature", "nature-tree"], ["luxury", "luxury-noir"],
  ["kids", "kids-unicorn"], ["celebration", "celebration-forever"], ["seasonal", "christmas-snowflake"],
] as const;

describe("recolourable collection artwork", () => {
  it.each(collectionExamples)("keeps a two-layer inline artwork contract for %s", (collection, modelId) => {
    const model = findCollectionModel(collection, modelId);
    expect(model?.supportsPrimaryColour).toBe(true);
    expect(model?.supportsAccentColour).toBe(true);
    const html = renderToStaticMarkup(createElement(CollectionArtwork, { artwork: model?.artwork ?? "", primaryColour: "#2563EB", accentColour: "#C99B45" }));
    expect(html).toContain('data-layer="primary"');
    expect(html).toContain('data-layer="accent"');
    expect(html).toContain("#2563EB");
    expect(html).toContain("#C99B45");
  });

  it("keeps primary and accent colour values independent in checkout configuration", () => {
    const configuration = calculateGuestCheckoutConfiguration({ collection: "breed", shape: "breed-pug", colour: "blue", lineColour: "gold", primaryColour: "blue", accentColour: "gold", size: "classic", finish: "matte", petName: "" });
    expect(configuration.primaryColour).toBe("blue");
    expect(configuration.accentColour).toBe("gold");
    expect(configuration.colour).toBe("blue");
    expect(configuration.lineColour).toBe("gold");
  });
});
