const DEFAULT_SITE_URL = "https://pettap.co.uk";
const DEFAULT_CONTACT_EMAIL = "hello@pettap.co.uk";

function configuredValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function toAbsoluteUrl(value: string | undefined) {
  if (!value) return undefined;

  const candidate = value.startsWith("http") ? value : `https://${value}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return undefined;
  }
}

export function getSiteUrl() {
  return (
    toAbsoluteUrl(configuredValue(process.env.NEXT_PUBLIC_SITE_URL)) ??
    toAbsoluteUrl(configuredValue(process.env.VERCEL_PROJECT_PRODUCTION_URL)) ??
    DEFAULT_SITE_URL
  );
}

export const siteConfig = {
  name: "PetTap",
  description:
    "Beautiful NFC pet tags that help lost pets find their way home in seconds.",
  url: getSiteUrl(),
  contactEmail:
    configuredValue(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ??
    DEFAULT_CONTACT_EMAIL,
} as const;
