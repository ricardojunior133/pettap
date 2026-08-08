import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CollectionModelPreview } from "@/components/studio/preview/CollectionModelPreview";
import { hasStudioPreviewDefinition, studioPreviewDefinitions } from "@/components/studio/preview/ModelArtwork";
import TagBackPreview from "@/components/studio/preview/TagBackPreview";
import { studioModels } from "@/lib/studio/options";

describe("model-specific Studio previews", () => {
  it("maps every canonical model to a dedicated vector preview", () => {
    expect(Object.keys(studioPreviewDefinitions)).toHaveLength(30);
    expect(studioModels.every((model) => hasStudioPreviewDefinition(model.id))).toBe(true);
  });

  it("keeps the photographic asset contract for the Step 2 model cards", () => {
    expect(studioModels.every((model) => model.image === `/studio/models/${model.collection}/${model.slug}.png`)).toBe(true);
  });

  it("fails safely for unknown model IDs", () => {
    expect(hasStudioPreviewDefinition("not-a-studio-model")).toBe(false);
  });

  it("passes both selected colours and the pet name to a canonical front preview", () => {
    const markup = renderToStaticMarkup(createElement(CollectionModelPreview, { accentColour: "#C99B45", collection: "cosmic", design: "cosmic-rocket", petName: "Charlie", primaryColour: "#2563EB", size: "classic" }));
    expect(markup).toContain('data-model-artwork="cosmic-rocket"');
    expect(markup).toContain('fill="#2563EB"');
    expect(markup).toContain('stroke="#C99B45"');
    expect(markup).toContain(">Charlie<");
  });

  it("retains the established shared NFC/PetTap back-side preview", () => {
    const markup = renderToStaticMarkup(createElement(TagBackPreview, { colour: "#2563EB", design: "cosmic-rocket", size: "classic" }));
    expect(markup).toContain("PetTap");
    expect(markup).toContain("TAP TO CONNECT");
  });
});
