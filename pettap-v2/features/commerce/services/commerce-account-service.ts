import "server-only";

import { getCurrentUser } from "@/lib/backend/auth/get-current-user";

export type AccountResolver = () => Promise<string>;

/** Resolves the authenticated account from the server session; browser input is never accepted. */
export async function getAuthenticatedAccountId(): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication is required to access Commerce data.");
  }

  return user.id;
}
