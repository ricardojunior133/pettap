import { getPriceForSize } from "@/src/lib/domain/tag";

import { designAllowsPetName, hasStudioColourContrastWarning, studioCollections, studioColours, studioFinishes, studioShapes, studioSizes } from "./options";
import type { StudioConfiguration } from "./types";

const collectionSku = {
  essential: "ESS",
  breed: "BRD",
  cats: "CAT",
  nature: "NAT",
  luxury: "LUX",
  kids: "KID",
  celebration: "CEL",
  seasonal: "SEA",
  bloom: "BLM",
  cosmic: "COS",
  adventure: "ADV",
  animal: "ANI",
} as const;

const sizeSku = { petite: "PET", classic: "CLA", explorer: "EXP" } as const;
const finishSku = { matte: "MAT", gloss: "GLS" } as const;

export function getStudioPrice(configuration: StudioConfiguration) {
  return getPriceForSize(configuration.size);
}

export function formatStudioPrice(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

/** A display-only SKU until the product catalogue and checkout own SKU allocation. */
export function generateStudioSku(configuration: StudioConfiguration) {
  const colour = studioColours.find((item) => item.value === configuration.colour);
  const collection = configuration.collection && collectionSku[configuration.collection as keyof typeof collectionSku];
  const shape = configuration.design.toUpperCase();
  const size = sizeSku[configuration.size];
  const finish = finishSku[configuration.finish];

  if (!collection || !shape || !size || !finish || !colour) return null;
  return ["PET", collection, shape, size, finish, colour.sku].join("-");
}

export function isStudioConfigurationComplete(configuration: StudioConfiguration) {
  return Boolean(
    (!designAllowsPetName(configuration.collection, configuration.design) || Boolean(configuration.petName.trim())) &&
    !hasStudioColourContrastWarning(configuration.colour, configuration.lineColour) &&
    (studioCollections.some((item) => item.id === configuration.collection) ||
      studioShapes.some((item) => item.collection === configuration.collection)) &&
    studioShapes.some((item) => item.id === configuration.design) &&
    studioColours.some((item) => item.value === configuration.colour) &&
    studioSizes.some((item) => item.id === configuration.size) &&
    studioFinishes.some((item) => item.id === configuration.finish),
  );
}
