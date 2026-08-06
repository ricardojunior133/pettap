import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in .env.local before migrations can run.");
}

function resolveMigrationDatabaseUrl() {
  if (process.env.USE_DIRECT_DATABASE_CONNECTION !== "1") return process.env.DATABASE_URL;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for a direct migration connection.");
  }

  const direct = new URL(process.env.DATABASE_URL);
  direct.hostname = `db.${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname}`;
  direct.port = "5432";
  direct.username = "postgres";
  return direct.toString();
}

async function run() {
  const client = postgres(resolveMigrationDatabaseUrl(), {
    ssl: "require",
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });

  try {
    if (process.env.USE_DIRECT_DATABASE_CONNECTION === "1") {
      console.log("Using a direct connection to the configured Supabase project for migrations.");
    }
    await client.unsafe("select 1");
    await migrate(drizzle(client), { migrationsFolder: "./db/migrations" });
    console.log("PetTap migrations applied successfully.");
  } finally {
    await client.end({ timeout: 5 });
  }
}

run().catch((error) => {
  console.error("PetTap migration failed:", {
    code: error.code ?? error.name ?? "Unknown error",
    message: error.message ?? "No diagnostic message was returned.",
    detail: error.detail ?? null,
    hint: error.hint ?? null,
    schema: error.schema ?? null,
    table: error.table ?? null,
    constraint: error.constraint ?? null,
  });
  process.exitCode = 1;
});
