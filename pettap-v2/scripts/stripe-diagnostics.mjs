import { config } from "dotenv";
import Stripe from "stripe";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

if (process.env.PETTAP_STRIPE_DIAGNOSTICS !== "1") {
  throw new Error("Diagnostics are disabled. Set PETTAP_STRIPE_DIAGNOSTICS=1 explicitly.");
}
if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") || !process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")) {
  throw new Error("Stripe Test Mode configuration is incomplete or not in Test Mode.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });

try {
  const [account, database] = await Promise.all([
    stripe.accounts.retrieve(null),
    sql`select 1 as connected`,
  ]);
  console.log({ stripe: { accountId: account.id, keyMode: "test" }, databaseConnected: database[0]?.connected === 1 });
} finally {
  await sql.end();
}
