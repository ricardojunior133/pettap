import { z } from "zod";
export const notificationPreferencesSchema = z.object({ internalNotifications: z.boolean(), securityEmails: z.boolean(), lostModeEmails: z.boolean(), rescueEmails: z.boolean(), nfcEmails: z.boolean(), medicalEmails: z.boolean(), productEmails: z.boolean(), activityDigest: z.boolean() }).strict();
