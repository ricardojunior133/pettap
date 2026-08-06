import { z } from "zod";

export const tagReasonCodes = ["reported_compromised", "reported_stolen", "fraud_suspected", "ownership_dispute", "security_incident", "manual_review", "other"] as const;

const reasonFields = z.object({
  reasonCode: z.enum(tagReasonCodes),
  reason: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (value.reasonCode === "other" && !value.reason?.trim()) {
    context.addIssue({ code: "custom", path: ["reason"], message: "Add a short reason when selecting Other." });
  }
});

export const suspendAdminTagSchema = reasonFields.extend({
  tagId: z.string().uuid(),
  confirmation: z.literal("SUSPEND"),
});

export const reactivateAdminTagSchema = reasonFields.extend({
  tagId: z.string().uuid(),
  confirmation: z.literal("REACTIVATE"),
});

export const reassignAdminTagSchema = reasonFields.extend({
  tagId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  destinationPetId: z.string().uuid(),
  confirmation: z.literal("REASSIGN"),
});

export type SuspendAdminTagInput = z.infer<typeof suspendAdminTagSchema>;
export type ReactivateAdminTagInput = z.infer<typeof reactivateAdminTagSchema>;
export type ReassignAdminTagInput = z.infer<typeof reassignAdminTagSchema>;
