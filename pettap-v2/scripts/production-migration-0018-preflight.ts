import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

export const MIGRATION_0018_HASH = "2e0a66a84a7857e10160d80193f27afc829fa47ec3b643dd1b7c2b5e77b6bfae";

type MetadataRow = { count?: number; definition?: string; hash?: string };

export type ReadOnlySqlClient = {
  unsafe: (query: string) => Promise<MetadataRow[]>;
  end: (options?: { timeout?: number }) => Promise<unknown>;
};

export type ReadOnlySqlFactory = (databaseUrl: string) => ReadOnlySqlClient;

export type PreflightResult = {
  code: 0 | 2 | 3 | 4;
  reason: "ready" | "database_url_missing" | "database_url_invalid" | "connection_failed" | "migration_state_mismatch";
  ledgerEntries?: number;
  migration0018Hashes?: number;
  publicMessageColumns?: number;
  limitConstraint?: boolean;
  historyMatching?: boolean;
};

function numberValue(rows: MetadataRow[]) {
  return Number(rows[0]?.count ?? 0);
}

export function isPostgresUrl(value: string | undefined): value is string {
  return Boolean(value && (value.startsWith("postgres://") || value.startsWith("postgresql://")));
}

export function createReadOnlySqlClient(databaseUrl: string): ReadOnlySqlClient {
  return postgres(databaseUrl, { connect_timeout: 5, max: 1 }) as unknown as ReadOnlySqlClient;
}

export function canonicalPredecessorHashes(migrationsDirectory = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations")) {
  return readdirSync(migrationsDirectory)
    .filter((name) => /^00(?:0[0-9]|1[0-7])_.*\.sql$/.test(name))
    .sort()
    .map((name) => createHash("sha256").update(readFileSync(join(migrationsDirectory, name))).digest("hex"));
}

export async function runMigration0018Preflight({
  databaseUrl = process.env.DATABASE_URL,
  createClient = createReadOnlySqlClient,
}: {
  databaseUrl?: string;
  createClient?: ReadOnlySqlFactory;
} = {}): Promise<PreflightResult> {
  if (!databaseUrl) return { code: 2, reason: "database_url_missing" };
  if (!isPostgresUrl(databaseUrl)) return { code: 2, reason: "database_url_invalid" };

  let sql: ReadOnlySqlClient | null = null;
  let transactionStarted = false;

  try {
    sql = createClient(databaseUrl);
    await sql.unsafe("BEGIN READ ONLY");
    transactionStarted = true;

    const ledgerEntries = numberValue(await sql.unsafe("SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations"));
    const remoteHistory = await sql.unsafe("SELECT hash FROM drizzle.__drizzle_migrations ORDER BY created_at ASC");
    const expectedHistory = canonicalPredecessorHashes();
    const historyMatching = remoteHistory.length === expectedHistory.length && remoteHistory.every((row, index) => row.hash === expectedHistory[index]);
    const migration0018Hashes = numberValue(await sql.unsafe(`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations WHERE hash = '${MIGRATION_0018_HASH}'`));
    const publicMessageColumns = numberValue(await sql.unsafe("SELECT count(*)::int AS count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pet_public_preferences' AND column_name = 'public_message'"));
    const constraints = await sql.unsafe("SELECT pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid JOIN pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'public' AND t.relname = 'pet_public_preferences' AND c.conname = 'pet_public_preferences_public_message_length'");
    const limitConstraint = constraints.length === 1 && /280/.test(constraints[0]?.definition ?? "");
    const ready = ledgerEntries === 18 && historyMatching && migration0018Hashes === 0 && publicMessageColumns === 0 && !limitConstraint;

    return { code: ready ? 0 : 4, reason: ready ? "ready" : "migration_state_mismatch", ledgerEntries, migration0018Hashes, publicMessageColumns, limitConstraint, historyMatching };
  } catch {
    return { code: 3, reason: "connection_failed" };
  } finally {
    if (sql) {
      if (transactionStarted) await sql.unsafe("ROLLBACK").catch(() => undefined);
      await sql.end({ timeout: 5 }).catch(() => undefined);
    }
  }
}

export async function main() {
  const result = await runMigration0018Preflight();
  console.log(JSON.stringify(result));
  process.exitCode = result.code;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void main();
}
