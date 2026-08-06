import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import type {
  CustomerProfileRecord,
  CustomerProfileRepository,
} from "@/features/owner/repositories/customer-profile-repository";
import { customerProfileInputSchema } from "@/features/owner/schemas/customer-profile";
import {
  CustomerProfileAuthorizationError,
  CustomerProfileService,
  type CustomerProfileSession,
} from "@/features/owner/services/customer-profile-service";

const accountA: CustomerProfileSession = { accountId: "account-a", email: "owner-a@example.test" };
const record: CustomerProfileRecord = {
  accountId: "account-a",
  displayName: "Alex Taylor",
  phone: "+44 7700 900123",
  preferredLanguage: "en-GB",
};
const input = { displayName: "Alexandra Taylor", phone: "+44 7700 900 124", preferredLanguage: "en-GB" as const };

function repository(overrides: Partial<CustomerProfileRepository> = {}): CustomerProfileRepository {
  return {
    getByAccountId: vi.fn().mockResolvedValue(record),
    updateByAccountId: vi.fn().mockResolvedValue({ ...record, ...input }),
    ...overrides,
  };
}

const repositorySource = readFileSync(resolve(process.cwd(), "features/owner/repositories/customer-profile-repository.ts"), "utf8");
const actionSource = readFileSync(resolve(process.cwd(), "features/owner/actions/customer-profile-actions.ts"), "utf8");
const uiSource = readFileSync(resolve(process.cwd(), "components/dashboard/CustomerProfile.tsx"), "utf8");

describe("Customer profile ownership", () => {
  it("reads only account A's profile", async () => {
    const repo = repository();
    const service = new CustomerProfileService(repo, async () => accountA);

    await expect(service.getProfile()).resolves.toMatchObject({ displayName: "Alex Taylor", email: accountA.email });
    expect(repo.getByAccountId).toHaveBeenCalledWith("account-a");
  });

  it("updates only the authenticated account", async () => {
    const repo = repository();
    const service = new CustomerProfileService(repo, async () => accountA);

    await service.updateProfile(input);
    expect(repo.updateByAccountId).toHaveBeenCalledWith("account-a", input, {
      changedFields: ["displayName", "phone"],
      languageChanged: false,
      preferencesChanged: false,
    });
  });

  it("does not reveal whether another account has a profile", async () => {
    const repo = repository({ getByAccountId: vi.fn().mockResolvedValue(null) });
    const service = new CustomerProfileService(repo, async () => accountA);

    await expect(service.getProfile()).rejects.toThrow("Your profile is unavailable.");
    expect(repo.getByAccountId).toHaveBeenCalledWith("account-a");
  });

  it("rejects anonymous callers before a repository operation", async () => {
    const repo = repository();
    const service = new CustomerProfileService(repo, async () => {
      throw new CustomerProfileAuthorizationError("Authentication is required.");
    });

    await expect(service.getProfile()).rejects.toThrow("Authentication is required.");
    expect(repo.getByAccountId).not.toHaveBeenCalled();
  });
});

describe("Customer profile validation and privacy", () => {
  it("trims strings and normalizes phone whitespace", () => {
    expect(customerProfileInputSchema.parse({ displayName: "  Alex Taylor  ", phone: "  +44   7700  900123 ", preferredLanguage: "en-GB" })).toEqual({
      displayName: "Alex Taylor",
      phone: "+44 7700 900123",
      preferredLanguage: "en-GB",
    });
  });

  it("rejects arbitrary fields and unsupported languages", () => {
    expect(customerProfileInputSchema.safeParse({ ...input, preferredLanguage: "pt-PT" }).success).toBe(false);
    expect(customerProfileInputSchema.safeParse({ ...input, role: "admin" }).success).toBe(false);
  });

  it("exposes only the safe profile view model", async () => {
    const service = new CustomerProfileService(repository(), async () => accountA);
    const viewModel = await service.getProfile();

    expect(viewModel).toEqual({ displayName: record.displayName, email: accountA.email, phone: record.phone, preferredLanguage: "en-GB" });
    for (const privateField of ["accountId", "customerId", "id", "role", "metadata", "createdAt", "updatedAt"]) {
      expect(viewModel).not.toHaveProperty(privateField);
    }
  });

  it("keeps the email read-only in the UI and out of the update action payload", () => {
    expect(uiSource).toContain('id="email" value={profile.email} readOnly');
    expect(actionSource).not.toContain('formData.get("email")');
  });
});

describe("Customer profile repository and audit contract", () => {
  it("uses owner-scoped profile reads and updates", () => {
    expect(repositorySource).toContain("where(eq(profiles.accountId, accountId))");
    expect(repositorySource).toContain("async updateByAccountId(");
    expect(repositorySource).toContain("where(eq(profiles.accountId, accountId))");
  });

  it("records only approved profile update audit metadata", () => {
    expect(repositorySource).toContain('action: "profile.updated"');
    expect(repositorySource).toContain("changedFields");
    expect(repositorySource).toContain("languageChanged");
    expect(repositorySource).toContain("preferencesChanged");
    const auditSection = repositorySource.slice(repositorySource.indexOf('action: "profile.updated"'), repositorySource.indexOf("return toRecord", repositorySource.indexOf('action: "profile.updated"')));
    for (const pii of ["displayName", "phone", "email", "postcode", "addressLine1"]) expect(auditSection).not.toContain(`${pii}:`);
  });

  it("revalidates profile and dashboard after a successful update", () => {
    expect(actionSource).toContain('revalidatePath("/dashboard/profile")');
    expect(actionSource).toContain('revalidatePath("/dashboard")');
  });

  it("uses the existing private settings payload to remain compatible before migration 0007", () => {
    expect(repositorySource).toContain("settings.payload");
    expect(repositorySource).not.toContain("profiles.preferredLanguage");
  });
});
