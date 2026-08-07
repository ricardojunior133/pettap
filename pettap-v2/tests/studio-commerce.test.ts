import { describe, expect, it } from "vitest";

import { generateStudioSku, getStudioPrice, isStudioConfigurationComplete } from "@/lib/studio/commerce";
import { initialStudioConfiguration } from "@/lib/studio/defaults";

describe("Studio commerce preparation", () => {
  it("uses the approved base prices for every size", () => {
    expect(getStudioPrice({ ...initialStudioConfiguration, size: "petite" })).toBe(19.99);
    expect(getStudioPrice(initialStudioConfiguration)).toBe(24.99);
    expect(getStudioPrice({ ...initialStudioConfiguration, size: "explorer" })).toBe(29.99);
  });

  it("creates a stable display SKU from the local configuration", () => {
    expect(generateStudioSku({ ...initialStudioConfiguration, design: "essential-round", petName: "Charlie" })).toBe("PET-ESS-ESSENTIAL-ROUND-CLA-MAT-BLK");
  });

  it("requires every commercial selection and a pet name", () => {
    expect(isStudioConfigurationComplete(initialStudioConfiguration)).toBe(false);
    expect(isStudioConfigurationComplete({ ...initialStudioConfiguration, petName: "Charlie" })).toBe(true);
    expect(isStudioConfigurationComplete({ ...initialStudioConfiguration, petName: "Charlie", collection: "unknown" })).toBe(false);
  });

  it("requires a pet name for collection artwork too", () => {
    const collectionConfiguration = { ...initialStudioConfiguration, collection: "adventure", design: "adventure-compass", petName: "" };
    expect(isStudioConfigurationComplete(collectionConfiguration)).toBe(false);
    expect(isStudioConfigurationComplete({ ...collectionConfiguration, petName: "Poppy" })).toBe(true);
  });
});
