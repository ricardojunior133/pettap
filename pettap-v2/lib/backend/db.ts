import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "./env";

let database: ReturnType<typeof drizzle> | undefined;

/** A process-local database client; repositories never expose it to the UI. */
export function createDatabaseClient() {
  if (database) return database;

  const connection = postgres(getServerEnv().DATABASE_URL, {
    prepare: false,
    ssl: "require",
    // The Supabase session pool used by development has a small client limit.
    // One shared server-side connection is sufficient for this application and
    // avoids development hot reloads exhausting the pool.
    max: 1,
    idle_timeout: 10,
    connect_timeout: 10,
  });

  database = drizzle(connection);
  return database;
}
