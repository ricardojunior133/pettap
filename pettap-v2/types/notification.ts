export type NotificationChannel = "push" | "email" | "sms";
export type NotificationStatus = "pending" | "sent" | "read";

export interface Notification {
  id: string;
  ownerId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  message: string;
}
