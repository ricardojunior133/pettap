import "server-only";

import { CONTACT_NOTIFICATION_WORKER_BATCH_SIZE, ContactRequestNotificationService } from "./contact-request-notification-service";

export type ProcessPendingNotificationsResult = {
  claimed: number;
  sent: number;
  retryScheduled: number;
  failed: number;
  cancelled: number;
};

export function summarizeNotificationProcessing(outcomes: readonly string[]): ProcessPendingNotificationsResult {
  return outcomes.reduce<ProcessPendingNotificationsResult>((summary, outcome) => {
    if (outcome === "sent") { summary.claimed += 1; summary.sent += 1; }
    if (outcome === "retry_scheduled") { summary.claimed += 1; summary.retryScheduled += 1; }
    if (outcome === "failed") { summary.claimed += 1; summary.failed += 1; }
    if (outcome === "cancelled") { summary.claimed += 1; summary.cancelled += 1; }
    return summary;
  }, { claimed: 0, sent: 0, retryScheduled: 0, failed: 0, cancelled: 0 });
}

/** Internal-only worker entry point. Callers cannot increase the server-side batch cap. */
export async function processPendingNotifications(): Promise<ProcessPendingNotificationsResult> {
  const outcomes = await new ContactRequestNotificationService().processPending(CONTACT_NOTIFICATION_WORKER_BATCH_SIZE);
  return summarizeNotificationProcessing(outcomes);
}
