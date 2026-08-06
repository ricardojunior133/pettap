import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Add it to .env.local before running Drizzle commands.");
}

export default defineConfig({ schema: "./db/schema/index.ts", out: "./db/migrations", dialect: "postgresql", dbCredentials: { url: process.env.DATABASE_URL } });
