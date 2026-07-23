import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getServerEnv } from "./env";
export function createDatabaseClient() { return drizzle(postgres(getServerEnv().DATABASE_URL, { prepare: false })); }
