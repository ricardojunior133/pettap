"use server";

import { revalidatePath } from "next/cache";

import { AdminTagNotFoundError, InvalidTagStateTransitionError, TagReassignmentConflictError, AdminTagService } from "../services/admin-tag-service";
import { reactivateAdminTagSchema, suspendAdminTagSchema } from "../schemas/admin-tag-actions";

export type AdminTagActionState = { status: "error" | "success"; message: string } | null;

function actionInput(formData: FormData) {
  return { tagId: formData.get("tagId"), reasonCode: formData.get("reasonCode"), reason: formData.get("reason"), confirmation: formData.get("confirmation") };
}

function messageFor(error: unknown) {
  if (error instanceof AdminTagNotFoundError) return "The tag is no longer available.";
  if (error instanceof InvalidTagStateTransitionError) return error.message;
  if (error instanceof TagReassignmentConflictError) return error.message;
  return "The tag action could not be completed.";
}

export async function suspendAdminTagAction(_previous: AdminTagActionState, formData: FormData): Promise<AdminTagActionState> {
  const parsed = suspendAdminTagSchema.safeParse(actionInput(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the suspension details." };
  try {
    await new AdminTagService().suspend(parsed.data);
  } catch (error) {
    return { status: "error", message: messageFor(error) };
  }
  revalidatePath(`/admin/tags/${parsed.data.tagId}`);
  return { status: "success", message: "Tag suspended. The future production rescue resolver must return its neutral unavailable state." };
}

export async function reactivateAdminTagAction(_previous: AdminTagActionState, formData: FormData): Promise<AdminTagActionState> {
  const parsed = reactivateAdminTagSchema.safeParse(actionInput(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the reactivation details." };
  try {
    await new AdminTagService().reactivate(parsed.data);
  } catch (error) {
    return { status: "error", message: messageFor(error) };
  }
  revalidatePath(`/admin/tags/${parsed.data.tagId}`);
  return { status: "success", message: "Tag reactivated." };
}
