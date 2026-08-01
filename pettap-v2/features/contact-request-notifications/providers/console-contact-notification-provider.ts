import "server-only";

import type { ContactNotificationEmail, ContactNotificationProvider } from "../types";

/** Development-only provider. It intentionally logs no finder or owner PII. */
export class ConsoleContactNotificationProvider implements ContactNotificationProvider {
  readonly name = "console";

  async send(email: ContactNotificationEmail) {
    console.info("Contact request notification prepared.", { idempotencyKey: email.idempotencyKey, subject: email.subject });
    return { providerMessageId: "console" };
  }
}
