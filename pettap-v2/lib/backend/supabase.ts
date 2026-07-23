import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env";

export function createSupabaseServerClient() { const env = getServerEnv(); return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } }); }
export function createSupabaseAdminClient() { const env = getServerEnv(); return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }); }
