import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import {
  generateNfcTagCredential,
  getNfcTagCredentialHint,
  hashNfcTagCredential,
  matchesNfcTagCredential,
} from "./credential-crypto";
import {
  DrizzleNfcTagCredentialRepository,
  type NfcTagCredentialRepository,
} from "./nfc-tag-credential-repository";
import {
  DrizzleNfcTagCredentialAuditService,
  type NfcTagCredentialAuditService,
  type NfcTagCredentialAuditAction,
} from "./nfc-tag-credential-audit-service";

type RequireTagsManagePermission = typeof requireAdminPermission;

export type IssuedNfcTagCredential = {
  credential: string;
  hint: string;
};

export type NfcCredentialLookup =
  | { tagId: string; publicCode?: never }
  | { publicCode: string; tagId?: never };

/**
 * Internal-only credential lifecycle. The plaintext value exists only in the
 * issue/rotate return value and is deliberately excluded from all persistence.
 */
export class NfcTagCredentialService {
  constructor(
    private readonly repository: NfcTagCredentialRepository = new DrizzleNfcTagCredentialRepository(),
    private readonly auditService: NfcTagCredentialAuditService = new DrizzleNfcTagCredentialAuditService(),
    private readonly requireTagsManagePermission: RequireTagsManagePermission = requireAdminPermission,
  ) {}

  async issueCredential(tagId: string): Promise<IssuedNfcTagCredential> {
    const actor = await this.requireTagsManagePermission("tags.manage");
    const issued = this.createIssuedCredential();
    await this.repository.issue({
      tagId,
      credentialHash: hashNfcTagCredential(issued.credential),
      credentialHint: issued.hint,
      createdByAccountId: actor.accountId,
    });
    await this.record(actor.accountId, "nfc.credential_issued", tagId, issued.hint);
    return issued;
  }

  async rotateCredential(tagId: string): Promise<IssuedNfcTagCredential> {
    const actor = await this.requireTagsManagePermission("tags.manage");
    const issued = this.createIssuedCredential();
    await this.repository.rotate({
      tagId,
      credentialHash: hashNfcTagCredential(issued.credential),
      credentialHint: issued.hint,
      createdByAccountId: actor.accountId,
    });
    await this.record(actor.accountId, "nfc.credential_rotated", tagId, issued.hint);
    return issued;
  }

  async revokeCredential(tagId: string): Promise<void> {
    const actor = await this.requireTagsManagePermission("tags.manage");
    const revoked = await this.repository.revoke(tagId);
    await this.record(actor.accountId, "nfc.credential_revoked", tagId, revoked.credentialHint);
  }

  /** Generic boolean result prevents callers from learning credential lifecycle details. */
  async verifyCredential(lookup: NfcCredentialLookup, credential: string): Promise<boolean> {
    const record = "tagId" in lookup
      ? await this.repository.findActiveByTagId(lookup.tagId)
      : await this.repository.findActiveByPublicCode(lookup.publicCode);
    return Boolean(record && matchesNfcTagCredential(credential, record.credentialHash));
  }

  private createIssuedCredential(): IssuedNfcTagCredential {
    const credential = generateNfcTagCredential();
    return { credential, hint: getNfcTagCredentialHint(credential) };
  }

  private async record(
    actorAccountId: string,
    action: NfcTagCredentialAuditAction,
    tagId: string,
    hint: string,
  ): Promise<void> {
    await this.auditService.record({ actorAccountId, action, tagId, hint });
  }
}
