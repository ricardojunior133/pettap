import "server-only";

import { requireAdminPermission } from "@/lib/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/backend/supabase";

import { DrizzleAdminCustomerRepository, type AdminCustomerRepository } from "../repositories/admin-customer-repository";
import type { AdminCustomerSearchInput } from "../schemas/admin-customer-search";

export class AdminCustomerNotFoundError extends Error {}

export interface AdminCustomerDetail {
  accountId: string;
  displayName: string;
  email: string | null;
  emailMismatchDetected: boolean;
  createdAt: string;
  petCount: number;
  tagCount: number;
}

async function authoritativeEmail(accountId: string): Promise<string | null> {
  const { data, error } = await createSupabaseAdminClient().auth.admin.getUserById(accountId);
  return error ? null : data.user?.email ?? null;
}

export class AdminCustomerService {
  constructor(private readonly repository: AdminCustomerRepository = new DrizzleAdminCustomerRepository()) {}

  async search(input: AdminCustomerSearchInput) {
    await requireAdminPermission("customers.read");
    return this.repository.search(input);
  }

  async get(accountId: string) {
    await requireAdminPermission("customers.read");
    const customer = await this.repository.findSummary(accountId);
    if (!customer) throw new AdminCustomerNotFoundError("Customer was not found.");
    return customer;
  }

  async getDetail(accountId: string): Promise<AdminCustomerDetail> {
    const customer = await this.get(accountId);
    const [authEmail, commerceEmail] = await Promise.all([authoritativeEmail(accountId), this.repository.findCommerceEmail(accountId)]);
    return { ...customer, email: authEmail, emailMismatchDetected: Boolean(authEmail && commerceEmail && authEmail.toLowerCase() !== commerceEmail.toLowerCase()) };
  }
}
