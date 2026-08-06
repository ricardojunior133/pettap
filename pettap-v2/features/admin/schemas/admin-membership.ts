import { z } from "zod";

import { adminRoleCodes } from "../constants/access";

export const grantAdminMembershipSchema = z.object({
  accountId: z.string().uuid(),
  roleCode: z.enum(adminRoleCodes),
}).strict();

export const changeAdminRoleSchema = z.object({
  membershipId: z.string().uuid(),
  roleCode: z.enum(adminRoleCodes),
}).strict();

export const disableAdminMembershipSchema = z.object({
  membershipId: z.string().uuid(),
}).strict();
