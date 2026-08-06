import type { NotificationProvider, TransactionalEmail } from "../types";

export class ConsoleNotificationProvider implements NotificationProvider {
  readonly name = "console";
  async send(email: TransactionalEmail) {
    if (process.env.NODE_ENV === "development") console.info("[transactional-email]", { to: email.to, subject: email.subject, template: email.template, payload: email.payload });
    return { providerMessageId: null };
  }
}
