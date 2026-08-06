import { describe, expect, it } from "vitest";

import { assertSuperAdminRetention, LastSuperAdminError } from "@/features/admin/services/super-admin-guard";

describe("last super administrator guard", () => {
  it("prevents demotion or disable when only one active super administrator remains", () => {
    expect(() => assertSuperAdminRetention({ currentRole: "super_admin", currentStatus: "active", nextRole: "admin", activeSuperAdminCount: 1 })).toThrow(LastSuperAdminError);
    expect(() => assertSuperAdminRetention({ currentRole: "super_admin", currentStatus: "active", disabling: true, activeSuperAdminCount: 1 })).toThrow(LastSuperAdminError);
  });

  it("allows a second super administrator to be changed", () => {
    expect(() => assertSuperAdminRetention({ currentRole: "super_admin", currentStatus: "active", nextRole: "admin", activeSuperAdminCount: 2 })).not.toThrow();
  });
});
