function configuredValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function configuredUrl(value: string | undefined) {
  const candidate = configuredValue(value);
  if (!candidate) return null;

  try {
    return new URL(candidate).toString();
  } catch {
    return null;
  }
}

const waitlistEndpoint = configuredValue(process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT);
const defaultContactEmail = "hello@pettap.co.uk";

export const launchConfig = {
  // The environment variable remains the deployment-time source of truth. The
  // fallback keeps the public support route available until that value is set.
  contactEmail:
    configuredValue(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ?? defaultContactEmail,
  instagramUrl: configuredUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  waitlistEnabled:
    process.env.NEXT_PUBLIC_WAITLIST_ENABLED === "true" && Boolean(waitlistEndpoint),
} as const;

/**
 * Production defaults to the Coming Soon experience. Set to "false" only when
 * the full public application is intentionally ready to be restored.
 */
export const isComingSoonLaunch =
  process.env.NODE_ENV === "production" &&
  process.env.PETTAP_COMING_SOON_MODE !== "false";
