"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "../public-env";

let browserClient: SupabaseClient | undefined;

/**
 * Browser client for future authenticated client interactions. Session state is
 * stored by Supabase in secure cookies; no custom localStorage is used.
 */
export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const env = getPublicSupabaseEnv();
  browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return browserClient;
}
