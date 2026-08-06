import "server-only";

import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import { ensureAccountProfile } from "@/features/owner/services/profile-service";

import type { AdminPermissionCode } from "../constants/access";
import { DrizzleAdminRepository, type AdminRepository } from "../repositories/admin-repository";
import type { AdminContextViewModel } from "../types/admin";
import { AdminAuditService } from "./admin-audit-service";

export class AdminPermissionDeniedError extends Error {
  constructor() {
    super("You do not have permission to perform this action.");
  }
}

type ProfileEnsurer = typeof ensureAccountProfile;

export class AdminAuthorizationService {
  constructor(
    private readonly repository: AdminRepository = new DrizzleAdminRepository(),
    private readonly auditService: AdminAuditService = new AdminAuditService(),
    private readonly currentUser = getCurrentUser,
    private readonly ensureProfile: ProfileEnsurer = ensureAccountProfile,
  ) {}

  async requirePermission(permission: AdminPermissionCode): Promise<AdminContextViewModel> {
    const user = await this.currentUser();
    if (!user) throw new AdminPermissionDeniedError();

    await this.ensureProfile({ authUserId: user.id, email: user.email, userMetadata: user.user_metadata });
    const membership = await this.repository.findActiveMembershipByAccountId(user.id);

    if (!membership) {
      await this.recordDenied(user.id, permission, "membership_missing");
      throw new AdminPermissionDeniedError();
    }

    const permissions = await this.repository.listPermissionsForRole(membership.role);
    if (!permissions.includes(permission)) {
      await this.recordDenied(user.id, permission, "permission_missing");
      throw new AdminPermissionDeniedError();
    }

    return {
      userId: user.id,
      accountId: user.id,
      membershipId: membership.id,
      role: membership.role,
      permissions,
    };
  }

  async assertPermission(context: AdminContextViewModel, permission: AdminPermissionCode): Promise<AdminContextViewModel> {
    if (!context.permissions.includes(permission)) {
      await this.recordDenied(context.accountId, permission, "permission_missing");
      throw new AdminPermissionDeniedError();
    }
    return context;
  }

  private async recordDenied(accountId: string, permission: AdminPermissionCode, reason: string) {
    try {
      await this.auditService.record({ actorAccountId: accountId, action: "admin.access.denied", targetType: "admin_area", result: "denied", metadata: { permission, reason } });
    } catch {
      // Authorization must remain fail-closed even if observability is unavailable.
    }
  }
}
