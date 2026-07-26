import "server-only";

import type { AdminPermissionCode } from "@/features/admin/constants/access";
import { AdminAuthorizationService } from "@/features/admin/services/admin-authorization-service";

export async function requireAdminPermission(permission: AdminPermissionCode) {
  return new AdminAuthorizationService().requirePermission(permission);
}
