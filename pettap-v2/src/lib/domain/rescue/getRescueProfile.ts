import { rescueMockProfiles } from "./mockProfiles";

export async function getRescueProfile(tagId: string) {
  return rescueMockProfiles[tagId.trim().toUpperCase()] ?? null;
}

export function getRescueProfileTagIds() {
  return Object.keys(rescueMockProfiles);
}
