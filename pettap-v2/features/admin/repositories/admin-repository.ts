import "server-only";

import { and, eq } from "drizzle-orm";

import { adminMemberships, adminPermissions, adminRolePermissions, adminRoles } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { AdminPermissionCode, AdminRoleCode } from "../constants/access";
import type { AdminMembershipRecord } from "../types/admin";

type MembershipWithRole = AdminMembershipRecord;

function membershipRecord(record: { id: string; accountId: string; role: string; status: string }): MembershipWithRole {
  return { id: record.id, accountId: record.accountId, role: record.role as AdminRoleCode, status: record.status as AdminMembershipRecord["status"] };
}

export interface AdminRepository {
  findActiveMembershipByAccountId(accountId: string): Promise<MembershipWithRole | null>;
  listPermissionsForRole(role: AdminRoleCode): Promise<AdminPermissionCode[]>;
}

export class DrizzleAdminRepository implements AdminRepository {
  async findActiveMembershipByAccountId(accountId: string): Promise<MembershipWithRole | null> {
    const database = createDatabaseClient();
    const [record] = await database
      .select({ id: adminMemberships.id, accountId: adminMemberships.accountId, role: adminRoles.code, status: adminMemberships.status })
      .from(adminMemberships)
      .innerJoin(adminRoles, eq(adminMemberships.roleId, adminRoles.id))
      .where(and(eq(adminMemberships.accountId, accountId), eq(adminMemberships.status, "active")))
      .limit(1);
    return record ? membershipRecord(record) : null;
  }

  async listPermissionsForRole(role: AdminRoleCode): Promise<AdminPermissionCode[]> {
    const database = createDatabaseClient();
    const records = await database
      .select({ code: adminPermissions.code })
      .from(adminRolePermissions)
      .innerJoin(adminRoles, eq(adminRolePermissions.roleId, adminRoles.id))
      .innerJoin(adminPermissions, eq(adminRolePermissions.permissionId, adminPermissions.id))
      .where(eq(adminRoles.code, role));
    return records.map((record) => record.code as AdminPermissionCode);
  }
}
