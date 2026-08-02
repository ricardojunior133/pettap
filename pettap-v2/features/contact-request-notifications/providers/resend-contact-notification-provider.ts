import "server-only";

import { Resend } from "resend";

import type { ContactNotificationEmail, ContactNotificationProvider } from "../types";

export type ResendContactNotificationClient = Pick<Resend, "emails">;

export class ResendContactNotificationProviderError extends Error {
  constructor(message: string) { super(message); this.name = "ResendContactNotificationProviderError"; }
}

/** Server-only adapter around the official Resend SDK. It never logs payloads. */
export class ResendContactNotificationProvider implements ContactNotificationProvider {
  readonly name = "resend";
  private readonly client: ResendContactNotificationClient;

  constructor(
    private readonly options: { apiKey: string; from: string; replyTo?: string },
    client?: ResendContactNotificationClient,
  ) {
    this.client = client ?? new Resend(options.apiKey);
  }

  async send(email: ContactNotificationEmail) {
    const { data, error } = await this.client.emails.send({
      from: this.options.from,
      to: email.to,
      replyTo: this.options.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }, { idempotencyKey: email.idempotencyKey });
    if (error) throw new ResendContactNotificationProviderError("Resend rejected the contact notification.");
    return { providerMessageId: data?.id ?? null };
  }
}
