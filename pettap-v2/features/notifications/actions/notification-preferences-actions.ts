"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/security/action-state";

import { notificationPreferencesSchema } from "../schemas/notification";
import { NotificationService } from "../services/notification-service";

export type PreferencesActionState = ActionState;

const preferenceKeys = [
  "internalNotifications",
  "securityEmails",
  "lostModeEmails",
  "rescueEmails",
  "nfcEmails",
  "medicalEmails",
  "productEmails",
  "activityDigest",
] as const;

export async function updateNotificationPreferencesAction(
  _previousState: PreferencesActionState,
  formData: FormData,
): Promise<PreferencesActionState> {
  void _previousState;

  const values = Object.fromEntries(
    preferenceKeys.map((key) => [key, formData.get(key) === "on"]),
  );
  const parsed = notificationPreferencesSchema.safeParse(values);

  if (!parsed.success) {
    return { status: "error", message: "Please review your preferences." };
  }

  try {
    await new NotificationService().updatePreferences(parsed.data);
    revalidatePath("/dashboard/settings/notifications");
    return { status: "success", message: "Preferences saved." };
  } catch {
    console.error("Notification preferences update failed.");
    return {
      status: "error",
      message: "We couldn’t save your preferences. Please try again.",
    };
  }
}
