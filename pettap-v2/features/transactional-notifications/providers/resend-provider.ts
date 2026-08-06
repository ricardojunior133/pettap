import "server-only";

import type { NotificationProvider, TransactionalEmail } from "../types";

const transientStatuses = new Set([429, 500, 503]);

export class ResendProviderError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "ResendProviderError";
  }
}

export type ResendProviderOptions = {
  apiKey: string;
  from: string;
  replyTo: string;
  fetcher?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  retries?: number;
};

/**
 * Server-only Resend adapter. It uses the documented HTTPS API directly so the
 * provider stays small, testable, and independent from a browser bundle.
 */
export class ResendNotificationProvider implements NotificationProvider {
  readonly name = "resend";
  private readonly fetcher: typeof fetch;
  private readonly sleep: (milliseconds: number) => Promise<void>;
  private readonly retries: number;

  constructor(private readonly options: ResendProviderOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
    this.retries = options.retries ?? 2;
  }

  async send(email: TransactionalEmail) {
    let lastError: ResendProviderError | null = null;

    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try {
        const response = await this.fetcher("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.options.from,
            to: [email.to],
            reply_to: this.options.replyTo,
            subject: email.subject,
            html: email.html,
            text: email.text,
            headers: {
              "X-Entity-Ref-ID": `${email.template}:${email.payload.orderNumber}`,
            },
          }),
        });

        if (response.ok) {
          const body = await response.json().catch(() => ({})) as { id?: unknown };
          return { providerMessageId: typeof body.id === "string" ? body.id : null };
        }

        lastError = new ResendProviderError("Resend rejected the transactional email.", response.status);
        if (!transientStatuses.has(response.status) || attempt === this.retries) throw lastError;
      } catch (error) {
        lastError = error instanceof ResendProviderError
          ? error
          : new ResendProviderError("Resend could not be reached.");
        if ((lastError.status && !transientStatuses.has(lastError.status)) || attempt === this.retries) throw lastError;
      }

      await this.sleep(250 * 2 ** attempt);
    }

    throw lastError ?? new ResendProviderError("Resend could not send the transactional email.");
  }
}
