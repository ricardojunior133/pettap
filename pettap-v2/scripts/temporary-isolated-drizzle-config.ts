import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const TEMPORARY_DRIZZLE_CONFIG_FILE = "drizzle.config.cjs";

function relativePathFrom(worktree: string, target: string) {
  const value = relative(worktree, target).replace(/\\/g, "/");
  return value.startsWith(".") ? value : `./${value}`;
}

export async function createTemporaryIsolatedDrizzleConfig({ directory, worktree }: { directory: string; worktree: string }) {
  await mkdir(directory, { recursive: true });
  const schema = relativePathFrom(worktree, join(directory, "schema", "index.ts"));
  const out = relativePathFrom(worktree, join(directory, "migrations"));
  const content = `module.exports = { schema: ${JSON.stringify(schema)}, out: ${JSON.stringify(out)}, dialect: "postgresql", dbCredentials: { url: process.env.DATABASE_URL || "postgresql://unconfigured" } };\n`;
  const file = join(directory, TEMPORARY_DRIZZLE_CONFIG_FILE);
  await writeFile(file, content, { encoding: "utf8", flush: true });
  return file;
}

export async function withTemporaryIsolatedDrizzleConfig<T>(options: { directory: string; worktree: string }, run: (file: string) => Promise<T>) {
  const file = await createTemporaryIsolatedDrizzleConfig(options);
  try {
    return await run(file);
  } finally {
    await rm(file, { force: true });
  }
}

async function main() {
  const [directory, worktree] = process.argv.slice(2);
  if (!directory || !worktree) {
    process.exitCode = 2;
    return;
  }
  console.log(await createTemporaryIsolatedDrizzleConfig({ directory, worktree }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  void main().catch(() => { process.exitCode = 3; });
}
