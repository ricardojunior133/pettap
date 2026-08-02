import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { afterEach, describe, expect, it } from "vitest";

import { createTemporaryMigration0018Postflight, withTemporaryMigration0018Postflight } from "@/scripts/temporary-migration-0018-postflight";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))); });

async function temporaryDirectory() {
  const directory = await mkdtemp(join(tmpdir(), "pettap-postflight-test-"));
  directories.push(directory);
  return directory;
}

describe("temporary migration 0018 postflight", () => {
  it("creates a UTF-8 script without a BOM or embedded DATABASE_URL", async () => {
    const file = await createTemporaryMigration0018Postflight(await temporaryDirectory());
    const bytes = await readFile(file);
    expect(bytes.subarray(0, 3)).not.toEqual(Buffer.from([0xef, 0xbb, 0xbf]));
    expect(bytes.toString("utf8")).toContain('require("postgres")');
    expect(bytes.toString("utf8")).not.toContain("DATABASE_URL=");
  });

  it("is syntactically executable from a path with spaces and imports postgres through NODE_PATH", async () => {
    const directory = await temporaryDirectory();
    const file = await createTemporaryMigration0018Postflight(join(directory, "path with spaces"));
    const result = spawnSync(process.execPath, [file], { env: { ...process.env, NODE_PATH: resolve("node_modules"), DATABASE_URL: "not-a-postgres-url" }, encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toBe("");
  });

  it("removes the temporary script after both success and failure callbacks", async () => {
    const directory = await temporaryDirectory();
    let successFile = "";
    await withTemporaryMigration0018Postflight(directory, async (file) => { successFile = file; });
    await expect(readFile(successFile)).rejects.toThrow();
    let failureFile = "";
    await expect(withTemporaryMigration0018Postflight(directory, async (file) => { failureFile = file; throw new Error("expected"); })).rejects.toThrow("expected");
    await expect(readFile(failureFile)).rejects.toThrow();
  });
});
