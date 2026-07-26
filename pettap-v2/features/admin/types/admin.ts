import type { AdminPermissionCode, AdminRoleCode } from "../constants/access";

export type AdminMembershipStatus = "active" | "disabled";

export interface AdminMembershipRecord {
  id: string;
  accountId: string;
  role: AdminRoleCode;
  status: AdminMembershipStatus;
}

export interface AdminContextViewModel {
  userId: string;
  accountId: string;
  membershipId: string;
  role: AdminRoleCode;
  permissions: readonly AdminPermissionCode[];
}
