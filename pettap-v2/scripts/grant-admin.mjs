import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

const allowedRoles = new Set(["support", "operations", "admin", "super_admin"]);
const args = process.argv.slice(2);
const valueFor = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const hasFlag = (name) => args.includes(name);
const accountId = valueFor("--account-id");
const email = valueFor("--email")?.trim().toLowerCase();
const role = valueFor("--role");

if ((!accountId && !email) || (accountId && email) || !role || !allowedRoles.has(role)) {
  throw new Error("Usage: npm run admin:grant -- --account-id <uuid> --role <support|operations|admin|super_admin> --confirm \"GRANT ROLE\" [--allow-remote]");
}
if (!process.env.DATABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Required server environment variables are missing.");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const remote = !["localhost", "127.0.0.1"].includes(databaseUrl.hostname) && !databaseUrl.hostname.endsWith(".local");
const confirmation = `GRANT ${role.replaceAll("_", " ").toUpperCase()}`;
if (valueFor("--confirm") !== confirmation) {
  throw new Error(`Confirmation required: --confirm \"${confirmation}\"`);
}
if (remote && !hasFlag("--allow-remote")) {
  throw new Error("Remote database detected. Review the target and add --allow-remote explicitly to continue.");
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function resolveUser() {
  if (accountId) {
    const { data, error } = await supabase.auth.admin.getUserById(accountId);
    if (error || !data.user) throw new Error("No Auth user was found for the supplied account ID.");
    return data.user;
  }

  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("The Auth user lookup failed.");
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 1000) break;
  }
  throw new Error("No Auth user was found for the supplied email.");
}

const user = await resolveUser();
console.info(`Target account: ${user.id}`);
console.info(`Role: ${role}`);
console.info(`Database target: ${remote ? "REMOTE" : "LOCAL"}`);

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1 });
try {
  const [account] = await sql`select id from public.accounts where id = ${user.id}`;
  if (!account) throw new Error("The Auth user does not yet have a PetTap account. Ask them to sign in first.");
  const [roleRecord] = await sql`select id from public.admin_roles where code = ${role}`;
  if (!roleRecord) throw new Error("Admin RBAC migration has not been applied or role is unavailable.");

  await sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtext('pettap:admin-memberships'))`;
    const [membership] = await transaction`
      insert into public.admin_memberships (account_id, role_id, status, created_by_account_id, disabled_at, disabled_by_account_id)
      values (${user.id}, ${roleRecord.id}, 'active', null, null, null)
      on conflict (account_id) do update set role_id = excluded.role_id, status = 'active', disabled_at = null, disabled_by_account_id = null, updated_at = now()
      returning id
    `;
    await transaction`
      insert into public.audit_logs (account_id, action, target_type, target_id, result, metadata)
      values (null, 'admin.bootstrap.granted', 'admin_membership', ${membership.id}, 'success', ${JSON.stringify({ source: "privileged_script", role })}::jsonb)
    `;
  });
  console.info("Administrative membership granted.");
} finally {
  await sql.end({ timeout: 5 });
}
