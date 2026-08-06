import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";

import { DrizzleAdminTimelineRepository, type AdminTimelineRepository } from "../repositories/admin-timeline-repository";

export class AdminTimelineService {
  constructor(private readonly repository: AdminTimelineRepository = new DrizzleAdminTimelineRepository()) {}

  async forAccount(accountId: string, before: Date | null = null, limit = 20) {
    await requireAdminPermission("activity.read");
    return this.repository.listForAccount(accountId, before, Math.min(Math.max(limit, 1), 100));
  }

  async forPet(petId: string, before: Date | null = null, limit = 20) {
    await requireAdminPermission("activity.read");
    return this.repository.listForPet(petId, before, Math.min(Math.max(limit, 1), 100));
  }

  async forTag(tagId: string, before: Date | null = null, limit = 20) {
    await requireAdminPermission("activity.read");
    return this.repository.listForTag(tagId, before, Math.min(Math.max(limit, 1), 100));
  }
}
