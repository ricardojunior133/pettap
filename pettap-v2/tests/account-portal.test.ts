import { describe, expect, it } from "vitest";

import {
  AccountPortalAuthorizationError,
  AccountPortalService,
} from "@/features/account/services/account-portal-service";

const user = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "owner@example.test",
  user_metadata: { display_name: "Alex Morgan" },
} as never;

describe("AccountPortalService", () => {
  it("returns a safe profile DTO without an account identifier", async () => {
    const service = new AccountPortalService(
      { findByAccountId: async () => ({ displayName: "Alex Morgan", phone: "+44 7700 900000" }) },
      async () => user,
    );

    await expect(service.getProfile()).resolves.toEqual({
      displayName: "Alex Morgan",
      email: "owner@example.test",
      phone: "+44 7700 900000",
      createdAt: null,
      lastSignInAt: null,
      emailVerified: false,
      preferences: { language: null, timeZone: null, communications: null },
    });
  });

  it("uses authenticated user metadata only as a profile fallback", async () => {
    const service = new AccountPortalService({ findByAccountId: async () => null }, async () => user);
    await expect(service.getOverview()).resolves.toMatchObject({ firstName: "Alex", orderHistory: "unavailable" });
  });

  it("rejects unauthenticated access before querying account data", async () => {
    let queried = false;
    const service = new AccountPortalService({ findByAccountId: async () => { queried = true; return null; } }, async () => null);
    await expect(service.getProfile()).rejects.toBeInstanceOf(AccountPortalAuthorizationError);
    expect(queried).toBe(false);
  });
});
