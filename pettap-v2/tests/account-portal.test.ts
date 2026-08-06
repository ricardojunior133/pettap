import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = (path: string) => readFileSync(join(root, path), "utf8");

describe("customer account portal", () => {
  it("provides the complete customer navigation and mobile menu", () => {
    const shell = source("components/account/AccountShell.tsx");
    for (const label of ["Dashboard", "My Pets", "My Tags", "Orders", "Addresses", "Account Settings", "Security", "Support"]) expect(shell).toContain(label);
    expect(shell).toContain("<details");
    expect(shell).toContain("logoutAction");
  });

  it("exposes the customer routes and uses owner-scoped services", () => {
    for (const path of ["app/account/pets/page.tsx", "app/account/tags/page.tsx", "app/account/orders/page.tsx", "app/account/orders/[orderId]/page.tsx", "app/account/addresses/page.tsx", "app/account/settings/page.tsx", "app/account/security/page.tsx"]) expect(existsSync(join(root, path))).toBe(true);
    expect(source("app/account/pets/page.tsx")).toContain("PetService");
    expect(source("app/account/tags/page.tsx")).toContain("TagService");
    expect(source("app/account/orders/page.tsx")).toContain("CustomerOrderService");
    expect(source("app/account/addresses/page.tsx")).toContain("CustomerAddressService");
    expect(source("app/account/loading.tsx")).toContain("Skeleton");
  });

  it("keeps orders inside the account portal and retains empty-state conversion", () => {
    expect(source("app/account/page.tsx")).toContain("Your first PetTap is waiting.");
    expect(source("app/account/page.tsx")).toContain("Start Designing");
    expect(source("app/account/orders/[orderId]/page.tsx")).toContain('basePath="/account/orders"');
  });
});
