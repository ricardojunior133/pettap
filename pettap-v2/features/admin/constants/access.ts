export const adminRoleCodes = ["admin", "super_admin"] as const;
export type AdminRoleCode = (typeof adminRoleCodes)[number];

export const adminPermissionCodes = ["event_demo.view", "event_demo.manage"] as const;
export type AdminPermissionCode = (typeof adminPermissionCodes)[number];

export const adminRoleLabels: Record<AdminRoleCode, string> = {
  admin: "Administrator",
  super_admin: "Super administrator",
};
