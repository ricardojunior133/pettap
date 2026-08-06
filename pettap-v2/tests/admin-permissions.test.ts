import { describe, expect, it, vi } from "vitest";

import type { AdminRepository } from "@/features/admin/repositories/admin-repository";
import { AdminAuditService } from "@/features/admin/services/admin-audit-service";
import { AdminAuthorizationService, AdminPermissionDeniedError } from "@/features/admin/services/admin-authorization-service";

function repositoryFor(role: "support" | "operations" | "admin" | "super_admin" | null, permissions: readonly string[]): AdminRepository {
  return {
    findActiveMembershipByAccountId: vi.fn().mockResolvedValue(role ? { id: "membership", accountId: "account", role, status: "active" } : null),
    listPermissionsForRole: vi.fn().mockResolvedValue(permissions),
    findMembershipById: vi.fn(),
    grantMembership: vi.fn(),
    changeRole: vi.fn(),
    disableMembership: vi.fn(),
    countActiveSuperAdmins: vi.fn(),
  };
}

const user = async () => ({ id: "account", email: "owner@example.test", user_metadata: {} }) as never;
const ensureProfile = async () => ({}) as never;

describe("admin authorization", () => {
  it("loads permissions from an active database membership", async () => {
    const service = new AdminAuthorizationService(repositoryFor("support", ["admin.dashboard.read"]), { record: vi.fn() } as unknown as AdminAuditService, user, ensureProfile);
    await expect(service.requirePermission("admin.dashboard.read")).resolves.toMatchObject({ role: "support", permissions: ["admin.dashboard.read"] });
  });

  it("denies an authenticated customer without a membership", async () => {
    const audit = { record: vi.fn() } as unknown as AdminAuditService;
    const service = new AdminAuthorizationService(repositoryFor(null, []), audit, user, ensureProfile);
    await expect(service.requirePermission("admin.dashboard.read")).rejects.toBeInstanceOf(AdminPermissionDeniedError);
  });

  it("denies an active member without the requested permission", async () => {
    const service = new AdminAuthorizationService(repositoryFor("support", ["customers.read"]), { record: vi.fn() } as unknown as AdminAuditService, user, ensureProfile);
    await expect(service.requirePermission("admins.manage")).rejects.toBeInstanceOf(AdminPermissionDeniedError);
  });
});
