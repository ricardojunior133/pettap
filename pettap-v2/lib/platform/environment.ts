export const platformEnvironment = {
  isProduction: process.env.NODE_ENV === "production",
  isBackendConfigured: Boolean(process.env.PETTAP_BACKEND_URL),
} as const;

export function requireBackend() {
  if (!platformEnvironment.isBackendConfigured) throw new Error("PetTap backend is not configured.");
}
