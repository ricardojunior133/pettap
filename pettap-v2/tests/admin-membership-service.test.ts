import { describe, expect, it, vi } from "vitest";

import type { AdminRepository } from "@/features/admin/repositories/admin-repository";
import { AdminMembershipConflictError, AdminMembershipService } from "@/features/admin/services/admin-membership-service";

const actor = { userId: "super", accountId: "super", membershipId: "actor-membership", role: "super_admin" as const, permissions: ["admins.manage"] as const };

function repository(targetAccountId = "target"): AdminRepository {
  return {
    findActiveMembershipByAccountId: vi.fn(),
    listPermissionsForRole: vi.fn(),
    findMembershipById: vi.fn().mockResolvedValue({ id: "target-membership", accountId: targetAccountId, role: "support", status: "active" }),
    grantMembership: vi.fn().mockResolvedValue({ id: "target-membership", accountId: targetAccountId, role: "support", status: "active" }),
    changeRole: vi.fn().mockResolvedValue({ id: "target-membership", accountId: targetAccountId, role: "operations", status: "active" }),
    disableMembership: vi.fn().mockResolvedValue({ id: "target-membership", accountId: targetAccountId, role: "support", status: "disabled" }),
    countActiveSuperAdmins: vi.fn(),
  };
}

describe("admin membership service", () => {
  it("requires admins.manage before granting membership", async () => {
    const authorization = { requirePermission: vi.fn().mockResolvedValue(actor) };
    const service = new AdminMembershipService(repository(), authorization);
    await service.grant("target", "support");
    expect(authorization.requirePermission).toHaveBeenCalledWith("admins.manage");
  });

  it("blocks self elevation and self disable", async () => {
    const authorization = { requirePermission: vi.fn().mockResolvedValue(actor) };
    const service = new AdminMembershipService(repository("super"), authorization);
    await expect(service.grant("super", "super_admin")).rejects.toBeInstanceOf(AdminMembershipConflictError);
    await expect(service.disable("target-membership")).rejects.toBeInstanceOf(AdminMembershipConflictError);
  });
});
