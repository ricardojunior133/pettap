export const COLLECTION_IDS = ["essential", "breed", "cats", "nature", "luxury", "kids", "celebration", "seasonal"] as const;
export type CollectionId = (typeof COLLECTION_IDS)[number];
export const SEASONAL_IDS = ["christmas", "halloween", "easter"] as const;
export type SeasonalId = (typeof SEASONAL_IDS)[number];

export const COLLECTION_SIZES = ["petite", "classic", "explorer"] as const;
export const COLLECTION_COLOURS = ["black", "white", "blue", "green", "purple", "pink", "orange", "red"] as const;

export interface CollectionModel {
  id: string;
  slug: string;
  name: string;
  collection: CollectionId;
  /** Inline artwork contract used by the recolourable Studio preview. */
  artwork: string;
  /** Static product render/photograph for cards and future commerce surfaces. */
  productImage: string;
  /** @deprecated Use productImage. Kept for existing image-card consumers. */
  image: string;
  supportsPersonalisation: true;
  supportsName: true;
  supportsPrimaryColour: true;
  supportsAccentColour: true;
  season?: SeasonalId;
  availableSizes: readonly (typeof COLLECTION_SIZES)[number][];
  availableColours: readonly (typeof COLLECTION_COLOURS)[number][];
  order: number;
}

export interface CollectionDefinition {
  id: CollectionId;
  title: string;
  description: string;
  allowsPetName: boolean;
}

export function createCollectionModels(collection: CollectionId, folder: string, entries: readonly string[], options?: { season?: SeasonalId; idPrefix?: string }): CollectionModel[] {
  return entries.map((name, index) => {
    const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return {
      id: `${options?.idPrefix ?? collection}-${slug}`,
      slug,
      name,
      collection,
      artwork: `/artwork/collections/${folder}/${slug}.svg`,
      productImage: `/images/collections/${folder}/${slug}.png`,
      image: `/images/collections/${folder}/${slug}.png`,
      supportsPersonalisation: true,
      supportsName: true,
      supportsPrimaryColour: true,
      supportsAccentColour: true,
      season: options?.season,
      availableSizes: COLLECTION_SIZES,
      availableColours: COLLECTION_COLOURS,
      order: index + 1,
    };
  });
}
