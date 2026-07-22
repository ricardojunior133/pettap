import { getRescueProfile, getRescueProfileTagIds } from "@/src/lib/domain/rescue";

/** Public rescue read API backed by local mocks for the current foundation. */
export function getRescueProfileByTagId(tagId: string) {
  return getRescueProfile(tagId);
}

export function getRescueTagIds() {
  return getRescueProfileTagIds();
}
