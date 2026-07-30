import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { isNfcTagCredential, hashNfcTagCredential } from "@/features/nfc/tag-credentials/credential-crypto";
import type { NfcTagStatus } from "@/features/nfc/domain/tag-status";

import {
  DrizzleNfcTagActivationRepository,
  type NfcTagActivationRepository,
  type TagActivationResult,
} from "./nfc-tag-activation-repository";

type CurrentUser = typeof getCurrentUser;
type RequireTagsManagePermission = typeof requireAdminPermission;

export type ActivateTagInput = {
  publicCode: string;
  credential: string;
  petId: string;
};

/** Server-only activation boundary. It never accepts an account ID from the caller. */
export class NfcTagActivationService {
  constructor(
    private readonly repository: NfcTagActivationRepository = new DrizzleNfcTagActivationRepository(),
    private readonly currentUser: CurrentUser = getCurrentUser,
    private readonly requireTagsManagePermission: RequireTagsManagePermission = requireAdminPermission,
  ) {}

  async activateTag(input: ActivateTagInput): Promise<TagActivationResult> {
    const actor = await this.currentUser();
    if (!actor) return { ok: false, code: "ACCOUNT_INACTIVE" };

    return this.repository.activate({
      publicCode: input.publicCode,
      credentialHash: this.validateActivation(input.credential),
      petId: input.petId,
      accountId: actor.id,
    });
  }

  /** Produces only a candidate hash for repository verification; plaintext remains outside persistence. */
  validateActivation(credential: string): string {
    return isNfcTagCredential(credential) ? hashNfcTagCredential(credential) : "0".repeat(64);
  }

  /** Safe owner-scoped read helper for future internal callers. Activation repeats this check in its transaction. */
  async verifyOwnership(petId: string): Promise<boolean> {
    const actor = await this.currentUser();
    return Boolean(actor && await this.repository.isPetOwnedByAccount(actor.id, petId));
  }

  /** Administrative lifecycle transition; public activation is the only unassigned → active route. */
  async changeStatus(publicCode: string, targetStatus: NfcTagStatus) {
    const actor = await this.requireTagsManagePermission("tags.manage");
    return this.repository.changeStatus({ publicCode, targetStatus, actorAccountId: actor.accountId });
  }
}
