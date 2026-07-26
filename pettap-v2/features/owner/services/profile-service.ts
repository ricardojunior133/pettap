import "server-only";

import type { User } from "@supabase/supabase-js";

import {
  DrizzleOwnerRepository,
  type AccountProfile,
  type OwnerRepository,
} from "../repositories/owner-repository";

export type EnsureAccountProfileInput = {
  authUserId: string;
  displayName?: string | null;
  email?: string | null;
  userMetadata?: User["user_metadata"];
};

export function resolveDisplayName({
  displayName,
  email,
  userMetadata,
}: Omit<EnsureAccountProfileInput, "authUserId">): string {
  const candidates = [
    displayName,
    typeof userMetadata?.display_name === "string"
      ? userMetadata.display_name
      : undefined,
    typeof userMetadata?.full_name === "string" ? userMetadata.full_name : undefined,
    email?.split("@", 1)[0],
  ];

  return candidates.find((candidate) => candidate?.trim())?.trim() ?? "PetTap owner";
}

export async function ensureAccountProfile(
  input: EnsureAccountProfileInput,
  repository: OwnerRepository = new DrizzleOwnerRepository(),
): Promise<AccountProfile> {
  return repository.ensureAccountProfile({
    authUserId: input.authUserId,
    displayName: resolveDisplayName(input),
  });
}
