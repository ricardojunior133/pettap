import "server-only";

import { ConsoleContactNotificationProvider } from "./providers/console-contact-notification-provider";
import { ResendContactNotificationProvider } from "./providers/resend-contact-notification-provider";
import type { ContactNotificationProvider } from "./types";

class UnconfiguredContactNotificationProvider implements ContactNotificationProvider {
  readonly name = "unconfigured";
  async send(email: Parameters<ContactNotificationProvider["send"]>[0]): Promise<{ providerMessageId: string | null }> {
    void email;
    throw new Error("Contact notification provider is not configured.");
  }
}

export type ContactNotificationProviderEnvironment = { RESEND_API_KEY?: string; EMAIL_FROM?: string; EMAIL_REPLY_TO?: string };

/** One provider selection point: console for development, injected fake for test, Resend for configured production. */
export function resolveContactNotificationProvider(nodeEnv: string | undefined, environment: ContactNotificationProviderEnvironment, testProvider?: ContactNotificationProvider): ContactNotificationProvider {
  if (nodeEnv === "test") return testProvider ?? new ConsoleContactNotificationProvider();
  if (nodeEnv === "development") return new ConsoleContactNotificationProvider();
  if (!environment.RESEND_API_KEY || !environment.EMAIL_FROM) return new UnconfiguredContactNotificationProvider();
  return new ResendContactNotificationProvider({ apiKey: environment.RESEND_API_KEY, from: environment.EMAIL_FROM, replyTo: environment.EMAIL_REPLY_TO });
}

export function getContactNotificationProvider() {
  return resolveContactNotificationProvider(process.env.NODE_ENV, { RESEND_API_KEY: process.env.RESEND_API_KEY, EMAIL_FROM: process.env.EMAIL_FROM, EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO });
}
