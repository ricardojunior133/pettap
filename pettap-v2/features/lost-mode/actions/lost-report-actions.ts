"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/security/action-state";

import {
  lostReportIdSchema,
  lostReportInputSchema,
} from "../schemas/lost-report";
import {
  LostReportNotFoundError,
  LostReportService,
} from "../services/lost-report-service";

export type LostReportActionState = ActionState;

function revalidateLostMode(petId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${petId}`);
  revalidatePath(`/dashboard/pets/${petId}/lost`);
}

export async function createLostReportAction(
  petId: string,
  _previousState: LostReportActionState,
  formData: FormData,
): Promise<LostReportActionState> {
  void _previousState;

  const parsed = lostReportInputSchema.safeParse({
    lastSeenAt: formData.get("lastSeenAt"),
    lastSeenLocation: formData.get("lastSeenLocation"),
    publicMessage: formData.get("publicMessage"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await new LostReportService().create(petId, parsed.data);
    revalidateLostMode(petId);
  } catch (error) {
    if (error instanceof LostReportNotFoundError) {
      return { status: "error", message: "We couldn’t find that pet." };
    }

    console.error("Lost report create failed.");
    return {
      status: "error",
      message: "We couldn’t create this lost alert. Please try again.",
    };
  }

  redirect(`/dashboard/pets/${petId}/lost`);
}

export async function resolveLostReportAction(
  petId: string,
  lostReportId: string,
  _previousState: LostReportActionState,
  formData: FormData,
): Promise<LostReportActionState> {
  void _previousState;
  void formData;

  if (!lostReportIdSchema.safeParse(lostReportId).success) {
    return {
      status: "error",
      message: "We could not update Lost Mode. Please try again.",
    };
  }

  try {
    const resolution = await new LostReportService().resolve(petId, lostReportId);
    if (resolution === "already-resolved") {
      return {
        status: "error",
        message: "This Lost Mode alert has already been resolved.",
      };
    }

    revalidateLostMode(petId);
    return {
      status: "success",
      message: "Lost Mode has been turned off. We’re glad your pet is safe.",
    };
  } catch (error) {
    if (error instanceof LostReportNotFoundError) {
      return {
        status: "error",
        message: "We could not update Lost Mode. Please try again.",
      };
    }

    console.error("Lost report resolution failed.");
    return {
      status: "error",
      message: "We could not update Lost Mode. Please try again.",
    };
  }
}
