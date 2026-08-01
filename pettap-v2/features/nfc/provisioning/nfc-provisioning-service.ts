import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";
import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { getServerEnv } from "@/lib/backend/env";
import { NfcTagActivationService, type TagActivationResult } from "@/features/nfc/tag-activation/nfc-tag-activation-service";
import { buildNfcProvisioningPayload } from "./provisioning-payload";
import { generateProvisioningChallenge, hashProvisioningChallenge, matchesProvisioningChallenge } from "./provisioning-crypto";
import type { NfcWriterAdapter, NfcProvisioningPayload } from "./nfc-writer-adapter";
import { DrizzleNfcProvisioningRepository, type NfcProvisioningRepository, type ProvisioningSession } from "./nfc-provisioning-repository";

export type ProvisioningFailure = "PROVISIONING_NOT_FOUND" | "PROVISIONING_FORBIDDEN" | "PROVISIONING_EXPIRED" | "PROVISIONING_STATE_INVALID" | "WRITE_VERIFICATION_FAILED";
export type ProvisioningResult<T> = { ok: true; value: T } | { ok: false; code: ProvisioningFailure };

/** Server-only orchestration. It knows no browser API and never persists plaintext secrets. */
export class NfcProvisioningService {
  constructor(
    private readonly repository: NfcProvisioningRepository = new DrizzleNfcProvisioningRepository(),
    private readonly activationService: Pick<NfcTagActivationService, "activateTag"> = new NfcTagActivationService(),
    private readonly currentUser: typeof getCurrentUser = getCurrentUser,
    private readonly requireTagsManage: typeof requireAdminPermission = requireAdminPermission,
    private readonly siteUrl: () => string = () => getServerEnv().NEXT_PUBLIC_SITE_URL,
  ) {}
  async startProvisioning(publicCode: string): Promise<ProvisioningResult<{ sessionId: string; challenge: string }>> {
    const actor = await this.requireTagsManage("tags.manage");
    const challenge = generateProvisioningChallenge();
    const session = await this.repository.start({ publicCode, actorAccountId: actor.accountId, challengeHash: hashProvisioningChallenge(challenge), expiresAt: new Date(Date.now() + 10 * 60_000) });
    return session ? { ok: true, value: { sessionId: session.id, challenge } } : { ok: false, code: "PROVISIONING_STATE_INVALID" };
  }
  async getProvisioningPayload(sessionId: string): Promise<ProvisioningResult<{ payload: NfcProvisioningPayload; expiresAt: Date }>> {
    const actor = await this.requireTagsManage("tags.manage");
    const session = await this.authoriseIssued(sessionId, actor.accountId);
    if (!session) return { ok: false, code: "PROVISIONING_FORBIDDEN" };
    const issued = await this.repository.issue(session.id, actor.accountId);
    if (!issued) return { ok: false, code: session.expiresAt <= new Date() ? "PROVISIONING_EXPIRED" : "PROVISIONING_STATE_INVALID" };
    return { ok: true, value: { payload: buildNfcProvisioningPayload(this.siteUrl(), issued.publicCode), expiresAt: issued.expiresAt } };
  }
  async confirmPhysicalWrite(sessionId: string, challenge: string, adapter: NfcWriterAdapter): Promise<ProvisioningResult<{ sessionId: string }>> {
    const actor = await this.requireTagsManage("tags.manage");
    const session = await this.repository.get(sessionId);
    if (!session || session.initiatedByAccountId !== actor.accountId) return { ok: false, code: "PROVISIONING_FORBIDDEN" };
    if (session.expiresAt <= new Date()) return { ok: false, code: "PROVISIONING_EXPIRED" };
    if (session.status !== "issued" || !matchesProvisioningChallenge(challenge, session.challengeHash)) return { ok: false, code: "PROVISIONING_STATE_INVALID" };
    const expected = buildNfcProvisioningPayload(this.siteUrl(), session.publicCode);
    if (!await adapter.isSupported() || !adapter.verify(expected, await adapter.readBack())) return { ok: false, code: "WRITE_VERIFICATION_FAILED" };
    const confirmed = await this.repository.confirmWrite(sessionId, actor.accountId);
    return confirmed ? { ok: true, value: { sessionId } } : { ok: false, code: "PROVISIONING_STATE_INVALID" };
  }
  async cancelProvisioning(sessionId: string): Promise<ProvisioningResult<{ sessionId: string }>> {
    const actor = await this.requireTagsManage("tags.manage");
    return await this.repository.cancel(sessionId, actor.accountId) ? { ok: true, value: { sessionId } } : { ok: false, code: "PROVISIONING_FORBIDDEN" };
  }
  async expireProvisioningSessions(now = new Date()) { await this.requireTagsManage("tags.manage"); return this.repository.expire(now); }
  async completeActivationFromProvisioning(input: { sessionId: string; credential: string; petId: string }): Promise<TagActivationResult | ProvisioningResult<never>> {
    const actor = await this.currentUser();
    if (!actor) return { ok: false, code: "PROVISIONING_FORBIDDEN" };
    const session = await this.repository.get(input.sessionId);
    if (!session || session.status !== "write_confirmed" || session.expiresAt <= new Date()) return { ok: false, code: "PROVISIONING_STATE_INVALID" };
    const activation = await this.activationService.activateTag({ publicCode: session.publicCode, credential: input.credential, petId: input.petId });
    if (activation.ok) await this.repository.markActivated(session.id);
    return activation;
  }
  private async authoriseIssued(sessionId: string, accountId: string): Promise<ProvisioningSession | null> {
    const session = await this.repository.get(sessionId);
    return session && session.initiatedByAccountId === accountId ? session : null;
  }
}
