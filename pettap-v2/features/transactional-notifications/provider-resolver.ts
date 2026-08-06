import "server-only";

import { getServerEnv } from "@/lib/backend/env";

import { ConsoleNotificationProvider } from "./providers/console-provider";
import { ResendNotificationProvider } from "./providers/resend-provider";
import type { NotificationProvider } from "./types";

class UnconfiguredNotificationProvider implements NotificationProvider {
  readonly name = "unconfigured";

  async send(): Promise<{ providerMessageId: string | null }> {
    throw new Error("No transactional email provider is configured for this environment.");
  }
}

type EmailProviderEnvironment = {
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
};

export function resolveTransactionalNotificationProvider(
  nodeEnv: string | undefined,
  environment: EmailProviderEnvironment,
): NotificationProvider {
  if (nodeEnv === "development" || nodeEnv === "test") {
    return new ConsoleNotificationProvider();
  }

  if (!environment.RESEND_API_KEY || !environment.EMAIL_FROM || !environment.EMAIL_REPLY_TO) {
    return new UnconfiguredNotificationProvider();
  }

  return new ResendNotificationProvider({
    apiKey: environment.RESEND_API_KEY,
    from: environment.EMAIL_FROM,
    replyTo: environment.EMAIL_REPLY_TO,
  });
}

/**
 * Keeps provider selection entirely on the server. Development intentionally
 * uses the console provider so no real email can be sent during local work.
 */
export function getTransactionalNotificationProvider(): NotificationProvider {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return new ConsoleNotificationProvider();
  }

  const env = getServerEnv();
  return resolveTransactionalNotificationProvider("production", {
    RESEND_API_KEY: env.RESEND_API_KEY,
    EMAIL_FROM: env.EMAIL_FROM,
    EMAIL_REPLY_TO: env.EMAIL_REPLY_TO,
  });
}
