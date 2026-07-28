import "server-only";

import type { User } from "@supabase/supabase-js";

import { getCurrentUser } from "@/lib/backend/auth/get-current-user";
import type { CustomerProfileInput } from "../schemas/profile";

import {
  DrizzleAccountProfileRepository,
  type AccountProfileRecord,
  type AccountProfileRepository,
} from "../repositories/account-profile-repository";

export class AccountPortalAuthorizationError extends Error {}

export type AccountProfileViewModel = {
  displayName: string;
  email: string | null;
  phone: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  emailVerified: boolean;
  preferences: { language: string | null; timeZone: string | null; communications: string | null };
};

export type AccountOverviewViewModel = {
  firstName: string;
  profile: AccountProfileViewModel;
  orderHistory: "unavailable";
};

export type AccountUserResolver = () => Promise<User | null>;

function fallbackDisplayName(user: User): string {
  const metadataName = user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim();
  return user.email?.split("@")[0] ?? "there";
}

function toProfileViewModel(user: User, profile: AccountProfileRecord | null): AccountProfileViewModel {
  const metadata = user.user_metadata ?? {};
  return {
    displayName: profile?.displayName || fallbackDisplayName(user),
    email: user.email ?? null,
    phone: profile?.phone ?? null,
    createdAt: user.created_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailVerified: Boolean(user.email_confirmed_at),
    preferences: {
      language: typeof metadata.locale === "string" ? metadata.locale : null,
      timeZone: typeof metadata.timezone === "string" ? metadata.timezone : null,
      communications: typeof metadata.communication_preference === "string" ? metadata.communication_preference : null,
    },
  };
}

export class AccountPortalService {
  constructor(
    private readonly repository: AccountProfileRepository = new DrizzleAccountProfileRepository(),
    private readonly resolveUser: AccountUserResolver = getCurrentUser,
  ) {}

  private async getAuthenticatedUser() {
    const user = await this.resolveUser();
    if (!user) throw new AccountPortalAuthorizationError("Authentication is required.");
    return user;
  }

  async getProfile(): Promise<AccountProfileViewModel> {
    const user = await this.getAuthenticatedUser();
    return toProfileViewModel(user, await this.repository.findByAccountId(user.id));
  }

  async updateProfile(input: CustomerProfileInput): Promise<AccountProfileViewModel> {
    const user = await this.getAuthenticatedUser();
    const profile = await this.repository.updateByAccountId(user.id, input);
    if (!profile) throw new Error("Profile is unavailable.");
    return toProfileViewModel(user, profile);
  }

  async getOverview(): Promise<AccountOverviewViewModel> {
    const profile = await this.getProfile();
    return {
      firstName: profile.displayName.split(/\s+/)[0] || "there",
      profile,
      // Commerce tables are not represented in the published schema baseline.
      // The UI must not query or simulate order data until that foundation is versioned.
      orderHistory: "unavailable",
    };
  }
}
