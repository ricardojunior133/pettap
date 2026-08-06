import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CustomerAddressRepository } from "@/features/commerce/repositories/customer-address-repository";
import { addressInputSchema } from "@/features/commerce/schemas/address";
import { CustomerAddressService } from "@/features/commerce/services/customer-address-service";

const address = { id: "address-a", type: "shipping" as const, fullName: "Alex Taylor", company: null, addressLine1: "1 Example Street", addressLine2: null, city: "London", county: null, postcode: "SW1A 1AA", countryCode: "GB", phone: null, isDefault: true };
const addressInput = { type: "shipping" as const, fullName: "Alex Taylor", company: null, addressLine1: "1 Example Street", addressLine2: null, city: "London", county: null, postcode: "SW1A 1AA", countryCode: "GB", phone: null, isDefault: true };
type AddressRepositoryPort = Pick<CustomerAddressRepository, "listByCustomer" | "create" | "update" | "setDefault" | "delete">;
function repository(overrides: Partial<AddressRepositoryPort> = {}): AddressRepositoryPort { return { listByCustomer: vi.fn().mockResolvedValue([address]), create: vi.fn().mockResolvedValue(address), update: vi.fn().mockResolvedValue(address), setDefault: vi.fn().mockResolvedValue(address), delete: vi.fn().mockResolvedValue(true), ...overrides } as AddressRepositoryPort; }
const repositorySource = readFileSync(resolve(process.cwd(), "features/commerce/repositories/customer-address-repository.ts"), "utf8");
const actionSource = readFileSync(resolve(process.cwd(), "features/commerce/actions/customer-address-actions.ts"), "utf8");
const uiSource = readFileSync(resolve(process.cwd(), "components/dashboard/CustomerAddresses.tsx"), "utf8");

describe("Customer address ownership", () => {
  it("lists only the authenticated account's addresses", async () => { const repo = repository(); const service = new CustomerAddressService(repo, async () => "account-a"); await expect(service.list()).resolves.toEqual([address]); expect(repo.listByCustomer).toHaveBeenCalledWith("account-a"); });
  it("returns a safe error when account A attempts to update account B's address", async () => { const repo = repository({ update: vi.fn().mockResolvedValue(null) }); const service = new CustomerAddressService(repo, async () => "account-a"); await expect(service.update("address-b", address)).rejects.toThrow("Address not found."); expect(repo.update).toHaveBeenCalledWith("account-a", "address-b", address); });
  it("returns a safe error when account A attempts to remove account B's address", async () => { const repo = repository({ delete: vi.fn().mockResolvedValue(false) }); const service = new CustomerAddressService(repo, async () => "account-a"); await expect(service.delete("address-b")).rejects.toThrow("Address not found."); expect(repo.delete).toHaveBeenCalledWith("account-a", "address-b"); });
  it("returns a safe error when account A attempts to set account B's address as default", async () => { const repo = repository({ setDefault: vi.fn().mockResolvedValue(null) }); const service = new CustomerAddressService(repo, async () => "account-a"); await expect(service.setDefault("address-b")).rejects.toThrow("Address not found."); expect(repo.setDefault).toHaveBeenCalledWith("account-a", "address-b"); });
  it("rejects an anonymous request before any repository operation", async () => { const repo = repository(); const service = new CustomerAddressService(repo, async () => { throw new Error("Authentication is required."); }); await expect(service.list()).rejects.toThrow("Authentication is required."); expect(repo.listByCustomer).not.toHaveBeenCalled(); });
  it("owner-scopes direct address reads, updates, defaults and deletes in the repository", () => { expect(repositorySource).toContain("eq(customers.accountId, accountId)"); expect(repositorySource).toContain("async getById(accountId: string, id: string)"); expect(repositorySource).toContain("async update(accountId: string, id: string"); expect(repositorySource).toContain("async setDefault(accountId: string, id: string)"); expect(repositorySource).toContain("async delete(accountId: string, id: string)"); });
  it("never accepts account or customer identifiers from browser address forms", () => { expect(actionSource).not.toContain("accountId"); expect(actionSource).not.toContain("customerId"); expect(uiSource).not.toContain("accountId"); expect(uiSource).not.toContain("customerId"); });
});

describe("Customer address default deletion", () => {
  it("uses one transaction for deletion and deterministic default promotion", () => { expect(repositorySource).toContain("async delete(accountId: string, id: string)"); expect(repositorySource).toContain("return db.transaction(async (tx) =>"); expect(repositorySource).toContain(".delete(customerAddresses)"); expect(repositorySource).toContain(".orderBy(asc(customerAddresses.createdAt), asc(customerAddresses.id))"); expect(repositorySource).toContain(".set({ isDefault: true, updatedAt: new Date() })"); });
  it("does not touch order snapshots while managing addresses", () => { expect(repositorySource).not.toContain("orders"); expect(repositorySource).not.toContain("shippingAddressSnapshot"); expect(repositorySource).not.toContain("billingAddressSnapshot"); });
  it("keeps default changes idempotent when the selected address is already default", async () => { const repo = repository({ setDefault: vi.fn().mockResolvedValue(address) }); const service = new CustomerAddressService(repo, async () => "account-a"); await expect(service.setDefault(address.id)).resolves.toEqual(address); expect(repo.setDefault).toHaveBeenCalledTimes(1); });
});

describe("Customer address view model and audit contract", () => {
  it("selects only the fields required by the dashboard UI", () => { for (const field of ["id", "type", "fullName", "company", "addressLine1", "addressLine2", "city", "county", "postcode", "countryCode", "phone", "isDefault"]) expect(repositorySource).toContain(`${field}: customerAddresses.`); });
  it("does not expose internal ownership, metadata or timestamps in the view model", () => { const selection = repositorySource.slice(repositorySource.indexOf("const customerAddressViewModelSelection"), repositorySource.indexOf("export class CustomerAddressRepository")); for (const privateField of ["customerId", "accountId", "metadata", "createdAt", "updatedAt"]) expect(selection).not.toContain(`${privateField}:`); });
  it("writes the four approved audit events with minimal metadata", () => { for (const event of ["address.created", "address.updated", "address.deleted", "address.default_changed"]) expect(repositorySource).toContain(`action: \"${event}\"`); for (const privateField of ["fullName", "company", "phone", "addressLine1", "addressLine2", "city", "county", "postcode"]) expect(repositorySource).not.toContain(`metadata: { ${privateField}`); });
});

describe("Customer address normalization", () => {
  it("uppercases country codes and normalizes UK postcodes", () => { const parsed = addressInputSchema.parse({ ...addressInput, fullName: "  Alex Taylor  ", postcode: " sw1a1aa ", countryCode: "gb" }); expect(parsed.countryCode).toBe("GB"); expect(parsed.postcode).toBe("SW1A 1AA"); expect(parsed.fullName).toBe("Alex Taylor"); });
  it("preserves international postcodes safely after trimming", () => { const parsed = addressInputSchema.parse({ ...addressInput, postcode: "  75008  ", countryCode: "fr" }); expect(parsed.countryCode).toBe("FR"); expect(parsed.postcode).toBe("75008"); });
  it("converts empty optional strings to null", () => { const parsed = addressInputSchema.parse({ ...addressInput, company: "  ", addressLine2: "", county: " ", phone: "" }); expect(parsed.company).toBeNull(); expect(parsed.addressLine2).toBeNull(); expect(parsed.county).toBeNull(); expect(parsed.phone).toBeNull(); });
  it("rejects invalid and arbitrary address payloads", () => { expect(addressInputSchema.safeParse({ ...addressInput, countryCode: "GBR" }).success).toBe(false); expect(addressInputSchema.safeParse({ ...addressInput, addressLine1: "", unexpected: true }).success).toBe(false); });
});

describe("Customer addresses UI contract", () => {
  it("renders every field supported by the address view model", () => { for (const field of ["fullName", "company", "phone", "addressLine1", "addressLine2", "city", "county", "postcode", "countryCode", "type", "isDefault"]) expect(uiSource).toContain(`name=\"${field}\"`); });
  it("prefills editing and requires confirmation before deletion", () => { expect(uiSource).toContain("defaultValue={editing?.fullName ?? \"\"}"); expect(uiSource).toContain("defaultValue={editing?.addressLine1 ?? \"\"}"); expect(uiSource).toContain("Delete this address?"); expect(uiSource).toContain("confirmDelete"); });
  it("hides the default action once an address is already default", () => { expect(uiSource).toContain("!address.isDefault ? <Button"); });
});
