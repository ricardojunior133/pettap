import { describe, expect, it } from "vitest";

import { customerProfileInputSchema } from "@/features/account/schemas/profile";
import { AccountPortalService } from "@/features/account/services/account-portal-service";
import { addressInputSchema } from "@/features/commerce/schemas/address";

const user = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "owner@example.test",
  created_at: "2026-07-01T10:00:00.000Z",
  last_sign_in_at: "2026-07-28T10:00:00.000Z",
  email_confirmed_at: "2026-07-01T10:01:00.000Z",
  user_metadata: { locale: "en-GB", timezone: "Europe/London" },
} as unknown as import("@supabase/supabase-js").User;

describe("customer profile", () => {
  it("reads only the authenticated user's profile and account metadata", async () => {
    const service = new AccountPortalService({
      findByAccountId: async (accountId: string) => accountId === user.id ? { displayName: "Alex Morgan", phone: "+44 7700 900000" } : null,
      updateByAccountId: async () => null,
    }, async () => user);

    await expect(service.getProfile()).resolves.toMatchObject({ displayName: "Alex Morgan", email: "owner@example.test", emailVerified: true, preferences: { language: "en-GB", timeZone: "Europe/London" } });
  });

  it("updates only allowlisted profile fields using the authenticated account", async () => {
    const calls: unknown[] = [];
    const service = new AccountPortalService({
      findByAccountId: async () => null,
      updateByAccountId: async (accountId: string, input: unknown) => { calls.push({ accountId, input }); return input as { displayName: string; phone: string | null }; },
    }, async () => user);
    const input = customerProfileInputSchema.parse({ displayName: "Alex Morgan", phone: "" });

    await expect(service.updateProfile(input)).resolves.toMatchObject({ displayName: "Alex Morgan", phone: null });
    expect(calls).toEqual([{ accountId: user.id, input: { displayName: "Alex Morgan", phone: null } }]);
  });

  it("rejects account identifiers and unknown profile fields from the browser payload", () => {
    expect(customerProfileInputSchema.safeParse({ displayName: "Alex", phone: null, accountId: "other" }).success).toBe(false);
    expect(customerProfileInputSchema.safeParse({ displayName: "", phone: null }).success).toBe(false);
  });

  it("keeps address input strict, normalised, and free from account/customer IDs", () => {
    const parsed = addressInputSchema.parse({ type: "shipping", fullName: "Alex Morgan", company: "", addressLine1: "1 Pet Street", addressLine2: "", city: "London", county: "", postcode: "sw1a1aa", countryCode: "gb", phone: "", isDefault: true });
    expect(parsed).toMatchObject({ countryCode: "GB", postcode: "SW1A 1AA", company: null, phone: null });
    expect(addressInputSchema.safeParse({ ...parsed, accountId: "other" }).success).toBe(false);
  });
});
