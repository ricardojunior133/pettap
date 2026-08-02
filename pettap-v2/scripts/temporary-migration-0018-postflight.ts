import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const TEMPORARY_POSTFLIGHT_FILE = "postflight.cjs";

const source = `const postgres = require("postgres");
const expectedHash = "2e0a66a84a7857e10160d80193f27afc829fa47ec3b643dd1b7c2b5e77b6bfae";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || !(url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
    process.exitCode = 2;
    return;
  }
  const sql = postgres(url, { connect_timeout: 5, max: 1 });
  try {
    await sql.unsafe("BEGIN READ ONLY");
    const ledger = await sql.unsafe("SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations");
    const applied = await sql.unsafe(\`SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations WHERE hash = '\${expectedHash}'\`);
    const column = await sql.unsafe("SELECT count(*)::int AS count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pet_public_preferences' AND column_name = 'public_message'");
    const constraint = await sql.unsafe("SELECT pg_get_constraintdef(c.oid) AS definition FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid JOIN pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'public' AND t.relname = 'pet_public_preferences' AND c.conname = 'pet_public_preferences_public_message_length'");
    await sql.unsafe("ROLLBACK");
    const result = { ledgerEntries: Number(ledger[0]?.count ?? 0), migration0018Hashes: Number(applied[0]?.count ?? 0), publicMessageColumns: Number(column[0]?.count ?? 0), limitConstraint: constraint.length === 1 && /280/.test(constraint[0]?.definition ?? "") };
    if (result.ledgerEntries !== 19 || result.migration0018Hashes !== 1 || result.publicMessageColumns !== 1 || !result.limitConstraint) process.exitCode = 4;
    console.log(JSON.stringify(result));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

void main().catch(() => { console.error("POSTFLIGHT_FAILED"); process.exitCode = 3; });
`;

export async function createTemporaryMigration0018Postflight(directory: string) {
  await mkdir(directory, { recursive: true });
  const file = join(directory, TEMPORARY_POSTFLIGHT_FILE);
  await writeFile(file, source, { encoding: "utf8", flush: true });
  return file;
}

export async function withTemporaryMigration0018Postflight<T>(directory: string, run: (file: string) => Promise<T>) {
  const file = await createTemporaryMigration0018Postflight(directory);
  try {
    return await run(file);
  } finally {
    await rm(file, { force: true });
  }
}

async function main() {
  const directory = process.argv[2];
  if (!directory) {
    process.exitCode = 2;
    return;
  }
  console.log(await createTemporaryMigration0018Postflight(directory));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void main().catch(() => { process.exitCode = 3; });
}
