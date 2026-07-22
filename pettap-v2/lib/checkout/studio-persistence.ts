import type { PetTagConfiguration } from "@/types/tag";

const storageKey = "pettap-studio-configuration";
const version = 1;

interface StoredStudioConfiguration {
  version: number;
  updatedAt: string;
  configuration: PetTagConfiguration;
}

function isConfiguration(value: unknown): value is PetTagConfiguration {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.petName === "string" && typeof item.design === "string" && typeof item.size === "string" && typeof item.colour === "string" && typeof item.material === "string" && typeof item.finish === "string" && typeof item.engravingFont === "string" && typeof item.engravingIcon === "string";
}

export function readStudioConfiguration(): PetTagConfiguration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const stored = parsed as Partial<StoredStudioConfiguration>;
    return stored.version === version && isConfiguration(stored.configuration) ? stored.configuration : null;
  } catch { return null; }
}

export function saveStudioConfiguration(configuration: PetTagConfiguration) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(storageKey, JSON.stringify({ version, updatedAt: new Date().toISOString(), configuration } satisfies StoredStudioConfiguration)); } catch { /* Storage can be unavailable. */ }
}

export function clearStudioConfiguration() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(storageKey); } catch { /* Storage can be unavailable. */ }
}
