export const contactRequestNotificationTypes = ["finder_contact_received"] as const;
export type ContactRequestNotificationType = (typeof contactRequestNotificationTypes)[number];
export type ContactRequestNotificationStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";

/**
 * `updated_at` becomes the persisted processing lease start only while a
 * notification is in `processing`. It is set by the conditional claim and is
 * not touched again until the notification reaches a terminal/retry state.
 */
export const PROCESSING_LEASE_DURATION_MS = 10 * 60 * 1000;

export type ContactNotificationEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

export interface ContactNotificationProvider {
  readonly name: string;
  send(email: ContactNotificationEmail): Promise<{ providerMessageId: string | null }>;
}
