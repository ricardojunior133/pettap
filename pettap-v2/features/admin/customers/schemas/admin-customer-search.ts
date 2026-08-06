import { z } from "zod";

const pageSize = z.coerce.number().int().min(1).max(100);

export const adminCustomerSearchSchema = z.object({
  query: z.string().trim().max(120).optional().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: pageSize.default(20),
  hasPets: z.enum(["all", "yes", "no"]).default("all"),
  hasTags: z.enum(["all", "yes", "no"]).default("all"),
  tagStatus: z.enum(["all", "unassigned", "active", "suspended", "lost", "retired"]).default("all"),
  sort: z.enum(["createdAt", "name"]).default("createdAt"),
}).superRefine((value, context) => {
  if (value.query.length > 0 && value.query.length < 3 && !/^[0-9a-f-]{36}$/i.test(value.query)) {
    context.addIssue({ code: "custom", path: ["query"], message: "Use at least three characters when searching by text." });
  }
});

export type AdminCustomerSearchInput = z.infer<typeof adminCustomerSearchSchema>;
