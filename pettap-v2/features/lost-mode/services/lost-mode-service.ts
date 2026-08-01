import "server-only";

import { transition, type NfcTagStatus } from "@/features/nfc/domain/tag-status";
import { getAuthenticatedAccountId, type AccountResolver } from "@/features/commerce/services/commerce-account-service";
import { DrizzleLostModeRepository, type LostModeAudit, type LostModeRepository, type LostModeStatus, type LostModeTransaction } from "../repositories/lost-mode-repository";
import type { DisableLostModeInput, EnableLostModeInput } from "../schemas/lost-mode";

export type LostModeResult = { state: "enabled" | "disabled" | "already_enabled" | "already_disabled"; tagId: string };
export type LostModeView = { state: "enabled" | "disabled"; tagId: string };

export class LostModeDomainError extends Error {
  constructor(readonly code: "UNAUTHENTICATED" | "PET_NOT_FOUND" | "TAG_NOT_FOUND" | "TAG_NOT_ELIGIBLE" | "INCONSISTENT_STATE" | "CONCURRENT_UPDATE") { super("Unable to update Lost Mode."); }
}

type Clock = () => Date;
type DeniedResult = { denied: LostModeDomainError["code"] };

export class LostModeService {
  constructor(
    private readonly repository: LostModeRepository = new DrizzleLostModeRepository(),
    private readonly accountResolver: AccountResolver = getAuthenticatedAccountId,
    private readonly clock: Clock = () => new Date(),
  ) {}

  async enable(input: EnableLostModeInput): Promise<LostModeResult> {
    const accountId = await this.accountId();
    const result = await this.repository.transaction(input.petId, async (tx): Promise<LostModeResult | DeniedResult> => {
      const pet = await tx.findOwnedPetForUpdate(accountId, input.petId);
      if (!pet) return this.denied(tx, accountId, null, input.petId, "lost.enable_denied", "pet_not_found", "PET_NOT_FOUND");
      const tag = await tx.findAssociatedTagForUpdate(accountId, pet.id);
      if (!tag) return this.denied(tx, accountId, null, pet.id, "lost.enable_denied", "tag_not_found", "TAG_NOT_FOUND");
      const report = await tx.findOpenReportForUpdate(tag.id);
      if (await this.isInconsistent(tx, accountId, tag.id, pet.id, tag.status, report)) return { denied: "INCONSISTENT_STATE" };
      if (tag.status === "lost") return { state: "already_enabled", tagId: tag.id };
      if (tag.status !== "active") return this.denied(tx, accountId, tag.id, pet.id, "lost.enable_denied", "tag_not_eligible", "TAG_NOT_ELIGIBLE", tag.status);

      const previousStatus = tag.status;
      const next = transition(previousStatus, "lost");
      await tx.createOpenReport({ petId: pet.id, tagId: tag.id, actorAccountId: accountId, details: input.details ?? null, openedAt: this.clock() });
      if (!await tx.updateTagStatus(tag.id, previousStatus, next)) throw new LostModeDomainError("CONCURRENT_UPDATE");
      await tx.addStatusHistory({ tagId: tag.id, previousStatus, newStatus: next, accountId, reasonCode: "lost_mode_enabled" });
      await tx.recordAudit({ action: "lost.enabled", accountId, tagId: tag.id, metadata: { petId: pet.id, status: next } });
      return { state: "enabled", tagId: tag.id };
    });
    return this.unwrap(result);
  }

  async disable(input: DisableLostModeInput): Promise<LostModeResult> {
    const accountId = await this.accountId();
    const result = await this.repository.transaction(input.petId, async (tx): Promise<LostModeResult | DeniedResult> => {
      const pet = await tx.findOwnedPetForUpdate(accountId, input.petId);
      if (!pet) return this.denied(tx, accountId, null, input.petId, "lost.disable_denied", "pet_not_found", "PET_NOT_FOUND");
      const tag = await tx.findAssociatedTagForUpdate(accountId, pet.id);
      if (!tag) return this.denied(tx, accountId, null, pet.id, "lost.disable_denied", "tag_not_found", "TAG_NOT_FOUND");
      const report = await tx.findOpenReportForUpdate(tag.id);
      if (await this.isInconsistent(tx, accountId, tag.id, pet.id, tag.status, report)) return { denied: "INCONSISTENT_STATE" };
      if (tag.status === "active") return { state: "already_disabled", tagId: tag.id };
      if (tag.status !== "lost" || !report) return this.denied(tx, accountId, tag.id, pet.id, "lost.disable_denied", "tag_not_eligible", "TAG_NOT_ELIGIBLE", tag.status);

      const previousStatus = tag.status;
      const next = transition(previousStatus, "active");
      await tx.closeOpenReport(report.id, this.clock());
      if (!await tx.updateTagStatus(tag.id, previousStatus, next)) throw new LostModeDomainError("CONCURRENT_UPDATE");
      await tx.addStatusHistory({ tagId: tag.id, previousStatus, newStatus: next, accountId, reasonCode: "lost_mode_disabled" });
      await tx.recordAudit({ action: "lost.disabled", accountId, tagId: tag.id, metadata: { petId: pet.id, status: next } });
      return { state: "disabled", tagId: tag.id };
    });
    return this.unwrap(result);
  }

  async getStatus(petId: string): Promise<LostModeView | null> {
    const accountId = await this.accountId();
    const current = await this.repository.getCurrentStatus(accountId, petId);
    if (!current) return null;
    if ((current.tag.status === "lost") !== Boolean(current.report)) throw new LostModeDomainError("INCONSISTENT_STATE");
    return { state: current.tag.status === "lost" ? "enabled" : "disabled", tagId: current.tag.id };
  }

  private async accountId(): Promise<string> {
    try { return await this.accountResolver(); } catch { throw new LostModeDomainError("UNAUTHENTICATED"); }
  }
  private async denied(tx: LostModeTransaction, accountId: string, tagId: string | null, petId: string, action: LostModeAudit["action"], reason: string, code: LostModeDomainError["code"], status?: NfcTagStatus): Promise<DeniedResult> {
    await tx.recordAudit({ action, accountId, tagId, result: "denied", metadata: { petId, reason, ...(status ? { status } : {}) } });
    return { denied: code };
  }
  private async isInconsistent(tx: LostModeTransaction, accountId: string, tagId: string, petId: string, status: NfcTagStatus, report: LostModeStatus["report"]): Promise<boolean> {
    if ((status === "lost") !== Boolean(report)) {
      await tx.recordAudit({ action: "lost.inconsistent", accountId, tagId, result: "denied", metadata: { petId, status, reason: "tag_report_mismatch" } });
      return true;
    }
    return false;
  }
  private unwrap(result: LostModeResult | DeniedResult): LostModeResult { if ("denied" in result) throw new LostModeDomainError(result.denied); return result; }
}
