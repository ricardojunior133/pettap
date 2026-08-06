"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionErrorState } from "@/lib/security/action-state";

import { activationInputSchema } from "../schemas/tag";
import {
  TagNotFoundError,
  TagService,
  TagUnavailableError,
} from "../services/tag-service";

export type TagActionState = ActionErrorState | null;

export async function activateTagAction(
  _previousState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  void _previousState;

  const parsed = activationInputSchema.safeParse({
    code: formData.get("code"),
    petId: formData.get("petId"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let tagId: string;
  try {
    const tag = await new TagService().activate(parsed.data.code, parsed.data.petId);
    tagId = tag.id;
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tags");
    revalidatePath(`/dashboard/pets/${parsed.data.petId}`);
  } catch (error) {
    if (error instanceof TagNotFoundError || error instanceof TagUnavailableError) {
      return { status: "error", message: "This tag cannot be activated." };
    }

    console.error("Tag activation failed.");
    return {
      status: "error",
      message: "We couldn’t activate this tag. Please try again.",
    };
  }

  redirect(`/dashboard/tags/${tagId}`);
}
