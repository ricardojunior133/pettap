import "server-only";

import { eq } from "drizzle-orm";

import { customers } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

export interface CustomerRecord {
  id: string;
  accountId: string;
  email: string;
  fullName: string;
  phone: string | null;
}

export interface CustomerRepository {
  findByAccountId(accountId: string): Promise<CustomerRecord | null>;
}

export class DrizzleCustomerRepository implements CustomerRepository {
  async findByAccountId(accountId: string): Promise<CustomerRecord | null> {
    const database = createDatabaseClient();
    const [customer] = await database
      .select({
        id: customers.id,
        accountId: customers.accountId,
        email: customers.email,
        fullName: customers.fullName,
        phone: customers.phone,
      })
      .from(customers)
      .where(eq(customers.accountId, accountId))
      .limit(1);

    return customer ?? null;
  }
}
