import type { AdminMembershipStatus } from "../types/admin";
import type { AdminRoleCode } from "../constants/access";

export class LastSuperAdminError extends Error {
  constructor() {
    super("The last active super administrator cannot be removed.");
  }
}

export function assertSuperAdminRetention(input: {
  currentRole: AdminRoleCode;
  currentStatus: AdminMembershipStatus;
  nextRole?: AdminRoleCode;
  disabling?: boolean;
  activeSuperAdminCount: number;
}) {
  const removesActiveSuperAdmin = input.currentRole === "super_admin"
    && input.currentStatus === "active"
    && (input.disabling || (input.nextRole !== undefined && input.nextRole !== "super_admin"));
  if (removesActiveSuperAdmin && input.activeSuperAdminCount <= 1) throw new LastSuperAdminError();
}
