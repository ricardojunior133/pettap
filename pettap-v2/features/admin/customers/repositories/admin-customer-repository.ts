import "server-only";

import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { accounts, customers, nfcTags, pets, profiles } from "@/db/schema";
import { createDatabaseClient } from "@/lib/backend/db";

import type { AdminCustomerSearchInput } from "../schemas/admin-customer-search";
import type { AdminCustomerSummaryViewModel } from "../../types/operations";

function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return null;
  return `${local.slice(0, 1)}***@${domain}`;
}

function toSummary(row: { accountId: string; displayName: string; email: string | null; createdAt: Date; petCount: number; tagCount: number }): AdminCustomerSummaryViewModel {
  return { accountId: row.accountId, displayName: row.displayName, maskedEmail: maskEmail(row.email), createdAt: row.createdAt.toISOString(), petCount: Number(row.petCount), tagCount: Number(row.tagCount) };
}

export interface AdminCustomerRepository {
  search(input: AdminCustomerSearchInput): Promise<{ items: AdminCustomerSummaryViewModel[]; total: number }>;
  findSummary(accountId: string): Promise<AdminCustomerSummaryViewModel | null>;
  findCommerceEmail(accountId: string): Promise<string | null>;
}

export class DrizzleAdminCustomerRepository implements AdminCustomerRepository {
  async search(input: AdminCustomerSearchInput): Promise<{ items: AdminCustomerSummaryViewModel[]; total: number }> {
    const database = createDatabaseClient();
    const predicates: SQL[] = [];
    const query = input.query.trim();

    if (query) {
      if (/^[0-9a-f-]{36}$/i.test(query)) {
        predicates.push(eq(accounts.id, query));
      } else if (/^PTP-/i.test(query)) {
        predicates.push(sql`exists (select 1 from ${nfcTags} where ${nfcTags.accountId} = ${accounts.id} and ${nfcTags.publicId} = ${query.toUpperCase()})`);
      } else {
        const wildcard = `%${query}%`;
        predicates.push(or(
          ilike(profiles.displayName, wildcard),
          ilike(customers.email, wildcard),
          sql`exists (select 1 from ${pets} where ${pets.accountId} = ${accounts.id} and ${pets.name} ilike ${wildcard})`,
          sql`exists (select 1 from ${nfcTags} where ${nfcTags.accountId} = ${accounts.id} and ${nfcTags.publicId} = ${query.toUpperCase()})`,
        )!);
      }
    }

    const petCount = sql<number>`count(distinct ${pets.id})`;
    const tagCount = sql<number>`count(distinct ${nfcTags.id})`;
    if (input.hasPets === "yes") predicates.push(sql`exists (select 1 from ${pets} where ${pets.accountId} = ${accounts.id})`);
    if (input.hasPets === "no") predicates.push(sql`not exists (select 1 from ${pets} where ${pets.accountId} = ${accounts.id})`);
    if (input.hasTags === "yes") predicates.push(sql`exists (select 1 from ${nfcTags} where ${nfcTags.accountId} = ${accounts.id})`);
    if (input.hasTags === "no") predicates.push(sql`not exists (select 1 from ${nfcTags} where ${nfcTags.accountId} = ${accounts.id})`);
    if (input.tagStatus !== "all") predicates.push(sql`exists (select 1 from ${nfcTags} where ${nfcTags.accountId} = ${accounts.id} and ${nfcTags.status} = ${input.tagStatus})`);
    const where = predicates.length ? and(...predicates) : undefined;

    const base = database
      .select({ accountId: accounts.id, displayName: profiles.displayName, email: customers.email, createdAt: accounts.createdAt, petCount, tagCount })
      .from(accounts)
      .innerJoin(profiles, eq(profiles.accountId, accounts.id))
      .leftJoin(customers, eq(customers.accountId, accounts.id))
      .leftJoin(pets, eq(pets.accountId, accounts.id))
      .leftJoin(nfcTags, eq(nfcTags.accountId, accounts.id));
    const rows = await (where ? base.where(where) : base)
      .groupBy(accounts.id, profiles.displayName, customers.email, accounts.createdAt)
      .orderBy(input.sort === "name" ? asc(profiles.displayName) : desc(accounts.createdAt))
      .limit(input.limit)
      .offset((input.page - 1) * input.limit);
    const [totalRow] = await (where ? database.select({ value: count() }).from(accounts).innerJoin(profiles, eq(profiles.accountId, accounts.id)).leftJoin(customers, eq(customers.accountId, accounts.id)).where(where) : database.select({ value: count() }).from(accounts).innerJoin(profiles, eq(profiles.accountId, accounts.id)).leftJoin(customers, eq(customers.accountId, accounts.id)));
    return { items: rows.map(toSummary), total: totalRow?.value ?? 0 };
  }

  async findSummary(accountId: string): Promise<AdminCustomerSummaryViewModel | null> {
    const result = await this.search({ query: accountId, page: 1, limit: 1, hasPets: "all", hasTags: "all", tagStatus: "all", sort: "createdAt" });
    return result.items[0] ?? null;
  }

  async findCommerceEmail(accountId: string): Promise<string | null> {
    const database = createDatabaseClient();
    const [customer] = await database.select({ email: customers.email }).from(customers).where(eq(customers.accountId, accountId)).limit(1);
    return customer?.email ?? null;
  }
}
