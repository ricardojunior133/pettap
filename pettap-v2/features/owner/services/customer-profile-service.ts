import "server-only";

import { getCurrentUser } from "@/lib/backend/auth/get-current-user";

import { ensureAccountProfile } from "./profile-service";
import type { CustomerProfileInput, CustomerProfileViewModel } from "../schemas/customer-profile";
import {
  DrizzleCustomerProfileRepository,
  type CustomerProfileRecord,
  type CustomerProfileRepository,
} from "../repositories/customer-profile-repository";

export class CustomerProfileAuthorizationError extends Error {}

export type CustomerProfileSession = {
  accountId: string;
  email: string;
};

export type CustomerProfileSessionResolver = () => Promise<CustomerProfileSession>;

async function resolveAuthenticatedProfileSession(): Promise<CustomerProfileSession> {
  const user = await getCurrentUser();
  if (!user || !user.email) throw new CustomerProfileAuthorizationError("Authentication is required.");

  await ensureAccountProfile({
    authUserId: user.id,
    email: user.email,
    userMetadata: user.user_metadata,
  });

  return { accountId: user.id, email: user.email };
}

function toViewModel(record: CustomerProfileRecord, email: string): CustomerProfileViewModel {
  return {
    displayName: record.displayName,
    email,
    phone: record.phone,
    preferredLanguage: record.preferredLanguage,
  };
}

function changedFields(current: CustomerProfileRecord, input: CustomerProfileInput) {
  const fields: string[] = [];
  if (current.displayName !== input.displayName) fields.push("displayName");
  if (current.phone !== input.phone) fields.push("phone");
  if (current.preferredLanguage !== input.preferredLanguage) fields.push("preferredLanguage");
  return fields;
}

export class CustomerProfileService {
  constructor(
    private readonly repository: CustomerProfileRepository = new DrizzleCustomerProfileRepository(),
    private readonly resolveSession: CustomerProfileSessionResolver = resolveAuthenticatedProfileSession,
  ) {}

  async getProfile(): Promise<CustomerProfileViewModel> {
    const session = await this.resolveSession();
    const record = await this.repository.getByAccountId(session.accountId);
    if (!record) throw new Error("Your profile is unavailable.");
    return toViewModel(record, session.email);
  }

  async updateProfile(input: CustomerProfileInput): Promise<CustomerProfileViewModel> {
    const session = await this.resolveSession();
    const current = await this.repository.getByAccountId(session.accountId);
    if (!current) throw new Error("Your profile is unavailable.");

    const fields = changedFields(current, input);
    if (fields.length === 0) return toViewModel(current, session.email);

    const updated = await this.repository.updateByAccountId(session.accountId, input, {
      changedFields: fields,
      languageChanged: fields.includes("preferredLanguage"),
      preferencesChanged: false,
    });
    if (!updated) throw new Error("Your profile is unavailable.");

    return toViewModel(updated, session.email);
  }
}
