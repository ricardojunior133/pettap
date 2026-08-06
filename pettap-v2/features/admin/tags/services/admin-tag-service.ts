import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import { DrizzleAdminTagRepository, type AdminTagRepository } from "../repositories/admin-tag-repository";
import type { ReactivateAdminTagInput, ReassignAdminTagInput, SuspendAdminTagInput } from "../schemas/admin-tag-actions";
import type { AdminTagSummaryViewModel } from "../../types/operations";

export class AdminTagNotFoundError extends Error {}
export class InvalidTagStateTransitionError extends Error {}
export class TagReassignmentConflictError extends Error {}

function toViewModel(tag: Awaited<ReturnType<AdminTagRepository["findById"]>> extends infer T ? Exclude<T, null> : never): AdminTagSummaryViewModel {
  return { id: tag.id, publicId: tag.publicId, status: tag.status, accountId: tag.accountId, petId: tag.petId, petName: tag.petName, ownerName: tag.ownerName, createdAt: tag.createdAt.toISOString(), activatedAt: tag.activatedAt?.toISOString() ?? null, suspendedAt: tag.suspendedAt?.toISOString() ?? null, suspensionReasonCode: tag.suspensionReasonCode };
}

export class AdminTagService {
  constructor(private readonly repository: AdminTagRepository = new DrizzleAdminTagRepository()) {}

  async get(tagId: string): Promise<AdminTagSummaryViewModel> {
    await requireAdminPermission("tags.read");
    const tag = await this.repository.findById(tagId);
    if (!tag) throw new AdminTagNotFoundError("Tag was not found.");
    return toViewModel(tag);
  }

  async listForAccount(accountId: string): Promise<AdminTagSummaryViewModel[]> {
    await requireAdminPermission("tags.read");
    return (await this.repository.listForAccount(accountId)).map(toViewModel);
  }

  async suspend(input: SuspendAdminTagInput): Promise<AdminTagSummaryViewModel> {
    const actor = await requireAdminPermission("tags.suspend");
    const result = await this.repository.suspend(input, actor.accountId);
    if (result === "not-found") throw new AdminTagNotFoundError("Tag was not found.");
    if (result === "already-suspended") return this.get(input.tagId);
    if (result === "invalid-state") throw new InvalidTagStateTransitionError("This tag cannot be suspended.");
    return toViewModel(result);
  }

  async reactivate(input: ReactivateAdminTagInput): Promise<AdminTagSummaryViewModel> {
    const actor = await requireAdminPermission("tags.reactivate");
    const result = await this.repository.reactivate(input, actor.accountId);
    if (result === "not-found") throw new AdminTagNotFoundError("Tag was not found.");
    if (result === "invalid-state") throw new InvalidTagStateTransitionError("Only suspended tags can be reactivated.");
    return toViewModel(result);
  }

  async reassign(input: ReassignAdminTagInput): Promise<AdminTagSummaryViewModel> {
    const actor = await requireAdminPermission("tags.reassign");
    const result = await this.repository.reassign(input, actor.accountId);
    if (result === "not-found") throw new AdminTagNotFoundError("Tag was not found.");
    if (result === "invalid-destination") throw new TagReassignmentConflictError("The destination pet does not belong to the destination account.");
    if (result === "invalid-state") throw new InvalidTagStateTransitionError("This tag cannot be reassigned in its current state.");
    return toViewModel(result);
  }
}
