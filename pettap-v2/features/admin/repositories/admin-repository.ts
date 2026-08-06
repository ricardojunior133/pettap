import "server-only";

import { and, count, eq } from "drizzle-orm";

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
  findMembershipById(membershipId: string): Promise<MembershipWithRole | null>;
  grantMembership(accountId: string, role: AdminRoleCode, createdByAccountId: string): Promise<MembershipWithRole>;
  changeRole(membershipId: string, role: AdminRoleCode, changedByAccountId: string): Promise<MembershipWithRole | null>;
  disableMembership(membershipId: string, disabledByAccountId: string): Promise<MembershipWithRole | null>;
  countActiveSuperAdmins(): Promise<number>;
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

  async findMembershipById(membershipId: string): Promise<MembershipWithRole | null> {
    const database = createDatabaseClient();
    const [record] = await database
      .select({ id: adminMemberships.id, accountId: adminMemberships.accountId, role: adminRoles.code, status: adminMemberships.status })
      .from(adminMemberships)
      .innerJoin(adminRoles, eq(adminMemberships.roleId, adminRoles.id))
      .where(eq(adminMemberships.id, membershipId))
      .limit(1);
    return record ? membershipRecord(record) : null;
  }

  async grantMembership(accountId: string, role: AdminRoleCode, createdByAccountId: string): Promise<MembershipWithRole> {
    const database = createDatabaseClient();
    const [roleRecord] = await database.select({ id: adminRoles.id }).from(adminRoles).where(eq(adminRoles.code, role)).limit(1);
    if (!roleRecord) throw new Error("Administrative role is unavailable.");

    const [record] = await database
      .insert(adminMemberships)
      .values({ accountId, roleId: roleRecord.id, status: "active", createdByAccountId })
      .returning({ id: adminMemberships.id, accountId: adminMemberships.accountId, status: adminMemberships.status });
    if (!record) throw new Error("Administrative membership could not be created.");
    return { ...record, role };
  }

  async changeRole(membershipId: string, role: AdminRoleCode): Promise<MembershipWithRole | null> {
    const database = createDatabaseClient();
    const [roleRecord] = await database.select({ id: adminRoles.id }).from(adminRoles).where(eq(adminRoles.code, role)).limit(1);
    if (!roleRecord) throw new Error("Administrative role is unavailable.");

    const [record] = await database
      .update(adminMemberships)
      .set({ roleId: roleRecord.id, updatedAt: new Date() })
      .where(eq(adminMemberships.id, membershipId))
      .returning({ id: adminMemberships.id, accountId: adminMemberships.accountId, status: adminMemberships.status });
    return record ? { ...record, role } : null;
  }

  async disableMembership(membershipId: string, disabledByAccountId: string): Promise<MembershipWithRole | null> {
    const existing = await this.findMembershipById(membershipId);
    if (!existing || existing.status === "disabled") return existing;

    const database = createDatabaseClient();
    const [record] = await database
      .update(adminMemberships)
      .set({ status: "disabled", disabledAt: new Date(), disabledByAccountId, updatedAt: new Date() })
      .where(and(eq(adminMemberships.id, membershipId), eq(adminMemberships.status, "active")))
      .returning({ id: adminMemberships.id, accountId: adminMemberships.accountId, status: adminMemberships.status });
    if (record) return { ...record, role: existing.role };

    return this.findMembershipById(membershipId);
  }

  async countActiveSuperAdmins(): Promise<number> {
    const database = createDatabaseClient();
    const [record] = await database
      .select({ value: count() })
      .from(adminMemberships)
      .innerJoin(adminRoles, eq(adminMemberships.roleId, adminRoles.id))
      .where(and(eq(adminMemberships.status, "active"), eq(adminRoles.code, "super_admin")));
    return record?.value ?? 0;
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
