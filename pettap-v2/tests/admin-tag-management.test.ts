import { describe, expect, it } from "vitest";

import { reactivateAdminTagSchema, reassignAdminTagSchema, suspendAdminTagSchema } from "@/features/admin/tags/schemas/admin-tag-actions";

const tagId = "11111111-1111-4111-8111-111111111111";

describe("admin NFC tag action schemas", () => {
  it("requires explicit confirmation and a reason for security actions", () => {
    expect(suspendAdminTagSchema.safeParse({ tagId, reasonCode: "manual_review", confirmation: "SUSPEND" }).success).toBe(true);
    expect(suspendAdminTagSchema.safeParse({ tagId, reasonCode: "manual_review", confirmation: "suspend" }).success).toBe(false);
    expect(suspendAdminTagSchema.safeParse({ tagId, reasonCode: "other", confirmation: "SUSPEND" }).success).toBe(false);
  });

  it("requires a stronger confirmation and destination for reassignment", () => {
    expect(reassignAdminTagSchema.safeParse({ tagId, destinationAccountId: tagId, destinationPetId: tagId, reasonCode: "ownership_dispute", confirmation: "REASSIGN" }).success).toBe(true);
    expect(reassignAdminTagSchema.safeParse({ tagId, destinationAccountId: tagId, destinationPetId: tagId, reasonCode: "ownership_dispute", confirmation: "SUSPEND" }).success).toBe(false);
  });

  it("allows reactivation only with explicit confirmation", () => {
    expect(reactivateAdminTagSchema.safeParse({ tagId, reasonCode: "manual_review", confirmation: "REACTIVATE" }).success).toBe(true);
  });
});
