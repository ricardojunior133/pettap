export const transactionalNotificationEvents = ["payment_received", "production_started", "printed", "packed", "shipped", "delivered", "order_cancelled"] as const;
export type TransactionalNotificationEvent = (typeof transactionalNotificationEvents)[number];
export type TransactionalEmailPayload = {
  orderNumber: string;
  petName: string;
  summary: string;
  accountUrl: string;
  orderTrackingUrl: string;
  carrierTrackingUrl?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
};
export type TransactionalEmail = { to: string; subject: string; template: TransactionalNotificationEvent; html: string; text: string; payload: TransactionalEmailPayload };
export interface NotificationProvider { readonly name: string; send(email: TransactionalEmail): Promise<{ providerMessageId: string | null }>; }
