import { describe, expect, it } from "vitest";

import { adminCustomerSearchSchema } from "@/features/admin/customers/schemas/admin-customer-search";

describe("admin customer search schema", () => {
  it("uses bounded, server-side pagination defaults", () => {
    expect(adminCustomerSearchSchema.parse({})).toMatchObject({ page: 1, limit: 20, query: "" });
    expect(adminCustomerSearchSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it("requires meaningful textual search terms but permits exact account IDs", () => {
    expect(adminCustomerSearchSchema.safeParse({ query: "ab" }).success).toBe(false);
    expect(adminCustomerSearchSchema.safeParse({ query: "11111111-1111-4111-8111-111111111111" }).success).toBe(true);
  });
});
