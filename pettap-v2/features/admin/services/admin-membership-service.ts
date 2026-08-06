import "server-only";

import type { AdminRoleCode } from "../constants/access";
import { DrizzleAdminRepository, type AdminRepository } from "../repositories/admin-repository";
import type { AdminMembershipRecord } from "../types/admin";
import { AdminAuthorizationService } from "./admin-authorization-service";

export class AdminMembershipConflictError extends Error {}

type AdminAuthorizer = Pick<AdminAuthorizationService, "requirePermission">;

export class AdminMembershipService {
  constructor(
    private readonly repository: AdminRepository = new DrizzleAdminRepository(),
    private readonly authorization: AdminAuthorizer = new AdminAuthorizationService(),
  ) {}

  async grant(accountId: string, role: AdminRoleCode): Promise<AdminMembershipRecord> {
    const actor = await this.authorization.requirePermission("admins.manage");
    if (actor.accountId === accountId) throw new AdminMembershipConflictError("You cannot change your own administrative membership.");
    const membership = await this.repository.grantMembership(accountId, role, actor.accountId);
    return membership;
  }

  async changeRole(membershipId: string, role: AdminRoleCode): Promise<AdminMembershipRecord | null> {
    const actor = await this.authorization.requirePermission("admins.manage");
    const target = await this.repository.findMembershipById(membershipId);
    if (!target) return null;
    if (target.accountId === actor.accountId) throw new AdminMembershipConflictError("You cannot change your own administrative role.");
    const membership = await this.repository.changeRole(membershipId, role, actor.accountId);
    return membership;
  }

  async disable(membershipId: string): Promise<AdminMembershipRecord | null> {
    const actor = await this.authorization.requirePermission("admins.manage");
    const target = await this.repository.findMembershipById(membershipId);
    if (!target) return null;
    if (target.accountId === actor.accountId) throw new AdminMembershipConflictError("You cannot disable your own administrative membership.");
    const membership = await this.repository.disableMembership(membershipId, actor.accountId);
    return membership;
  }
}
