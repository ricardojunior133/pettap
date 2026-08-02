import { describe, expect, it } from "vitest";

import { canonicalPredecessorHashes, MIGRATION_0018_HASH, runMigration0018Preflight, type ReadOnlySqlClient } from "@/scripts/production-migration-0018-preflight";

function mockClient(rows: Array<Array<{ count?: number; definition?: string }>>) {
  const queries: string[] = [];
  const client: ReadOnlySqlClient = {
    unsafe: async (query) => { queries.push(query); return rows.shift() ?? []; },
    end: async () => undefined,
  };
  return { client, queries };
}

describe("production migration 0018 preflight", () => {
  it("returns a clear code without DATABASE_URL", async () => {
    await expect(runMigration0018Preflight({ databaseUrl: undefined, createClient: () => { throw new Error("must not connect"); } })).resolves.toEqual({ code: 2, reason: "database_url_missing" });
  });

  it("rejects a non-PostgreSQL URL before connecting", async () => {
    await expect(runMigration0018Preflight({ databaseUrl: "https://invalid.example", createClient: () => { throw new Error("must not connect"); } })).resolves.toEqual({ code: 2, reason: "database_url_invalid" });
  });

  it("returns a connection failure for a fictitious PostgreSQL URL without opening a real connection", async () => {
    await expect(runMigration0018Preflight({ databaseUrl: "postgresql://invalid.invalid/test", createClient: () => { throw new Error("network disabled"); } })).resolves.toEqual({ code: 3, reason: "connection_failed" });
  });

  it("uses only read-only metadata queries and closes its injected client", async () => {
    const history = canonicalPredecessorHashes().map((hash) => ({ hash }));
    const { client, queries } = mockClient([[], [{ count: 18 }], history, [{ count: 0 }], [{ count: 0 }], []]);
    await expect(runMigration0018Preflight({ databaseUrl: "postgresql://example.invalid/test", createClient: () => client })).resolves.toMatchObject({ code: 0, reason: "ready", ledgerEntries: 18, historyMatching: true });
    expect(queries[0]).toBe("BEGIN READ ONLY");
    expect(queries).toContain("ROLLBACK");
    expect(queries.join(" ")).toContain(MIGRATION_0018_HASH);
    expect(queries.join(" ")).not.toMatch(/\b(insert|update|delete|alter|create|drop)\b/i);
  });

  it("blocks migration when the remote history is not the canonical 0000–0017 chain", async () => {
    const { client } = mockClient([[], [{ count: 18 }], Array.from({ length: 18 }, () => ({ hash: "wrong" })), [{ count: 0 }], [{ count: 0 }], []]);
    await expect(runMigration0018Preflight({ databaseUrl: "postgresql://example.invalid/test", createClient: () => client })).resolves.toMatchObject({ code: 4, reason: "migration_state_mismatch", historyMatching: false });
  });
});
