import { isCollectionId, type SeasonalId } from "@/lib/domain/collections";
import { findStudioModel, isStudioCollectionId, modelsForStudioCollection, studioColours, studioLineColours } from "@/lib/studio/options";

const collectionAliases = { cat: "cats", christmas: "seasonal", halloween: "seasonal", easter: "seasonal" } as const;
const seasons = new Set<SeasonalId>(["christmas", "halloween", "easter"]);
type StudioQuery = Record<string, string | string[] | undefined>;
const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export function resolveStudioCollection(value: string | string[] | undefined) {
  const requested = firstValue(value);
  const collection = requested ? (collectionAliases[requested as keyof typeof collectionAliases] ?? requested) : undefined;
  return collection && (isStudioCollectionId(collection) || isCollectionId(collection)) ? collection : undefined;
}

/** Resolves public card links on the server before Studio state is initialised. */
export function resolveStudioInitialConfiguration(searchParams: StudioQuery) {
  const rawCollection = firstValue(searchParams.collection);
  const collection = resolveStudioCollection(rawCollection) ?? "essential";
  const rawSeason = firstValue(searchParams.season) ?? (seasons.has(rawCollection as SeasonalId) ? rawCollection as SeasonalId : undefined);
  const requestedSeason = rawSeason && seasons.has(rawSeason as SeasonalId) ? rawSeason as SeasonalId : undefined;
  const season = collection === "seasonal" ? requestedSeason ?? "christmas" : undefined;
  const models = modelsForStudioCollection(collection, season);
  const requestedModel = firstValue(searchParams.model);
  const selectedModel = requestedModel ? findStudioModel(collection, requestedModel) : null;
  const design = selectedModel && (collection !== "seasonal" || selectedModel.season === season) ? selectedModel.id : models[0]?.id;
  const primaryColour = studioColours.some((colour) => colour.value === firstValue(searchParams.primaryColour)) ? firstValue(searchParams.primaryColour) : undefined;
  const accentColour = studioLineColours.some((colour) => colour.value === firstValue(searchParams.accentColour)) ? firstValue(searchParams.accentColour) : undefined;
  return { collection, design, season, colour: primaryColour, lineColour: accentColour };
}
