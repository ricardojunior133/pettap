export type NotificationCategory = "pet" | "lost_mode" | "nfc" | "medical" | "system";
export type NotificationViewModel = { id: string; category: NotificationCategory; title: string; message: string; createdAt: string; actionUrl?: string };
export type NotificationPreferences = { internalNotifications: boolean; securityEmails: boolean; lostModeEmails: boolean; rescueEmails: boolean; nfcEmails: boolean; medicalEmails: boolean; productEmails: boolean; activityDigest: boolean };
export const defaultNotificationPreferences: NotificationPreferences = { internalNotifications: true, securityEmails: true, lostModeEmails: true, rescueEmails: true, nfcEmails: true, medicalEmails: true, productEmails: false, activityDigest: false };
