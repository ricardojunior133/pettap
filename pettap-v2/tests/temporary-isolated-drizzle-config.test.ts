import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createTemporaryIsolatedDrizzleConfig, withTemporaryIsolatedDrizzleConfig } from "@/scripts/temporary-isolated-drizzle-config";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))); });

async function directoryWithSpaces() {
  const directory = await mkdtemp(join(tmpdir(), "pettap drizzle config "));
  directories.push(directory);
  return directory;
}

describe("temporary isolated Drizzle config", () => {
  it("creates a self-contained CommonJS config with relative isolated schema and migrations", async () => {
    const directory = await directoryWithSpaces();
    const file = await createTemporaryIsolatedDrizzleConfig({ directory, worktree: resolve(".") });
    const source = await readFile(file, "utf8");
    expect(source).toContain("module.exports");
    expect(source).not.toContain("drizzle-kit");
    expect(source).toContain("process.env.DATABASE_URL");
    expect(source).toContain("schema/index.ts");
    expect(source).toContain("migrations");
    expect(source).not.toContain("DATABASE_URL=");
  });

  it("removes the config after success and failure callbacks", async () => {
    const directory = await directoryWithSpaces();
    let successFile = "";
    await withTemporaryIsolatedDrizzleConfig({ directory, worktree: resolve(".") }, async (file) => { successFile = file; });
    await expect(readFile(successFile)).rejects.toThrow();
    let failureFile = "";
    await expect(withTemporaryIsolatedDrizzleConfig({ directory, worktree: resolve(".") }, async (file) => { failureFile = file; throw new Error("expected"); })).rejects.toThrow("expected");
    await expect(readFile(failureFile)).rejects.toThrow();
  });
});
