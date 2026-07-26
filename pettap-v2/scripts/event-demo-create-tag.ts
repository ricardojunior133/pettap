import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

async function main() {
  const argument = process.argv.find((value) => value.startsWith("--name="));
  const internalName = argument?.slice("--name=".length).trim();

  if (!internalName) {
    throw new Error('Usage: npm run event-demo:create-tag -- --name="Fair Demo 01"');
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("This development tool cannot run with NODE_ENV=production.");
  }

  const [{ EventDemoTagService }, { EventDemoTagRepository }, { getServerEnv }] = await Promise.all([
    import("../features/event-demo/services/event-demo-tag-service"),
    import("../features/event-demo/repositories/event-demo-tag-repository"),
    import("../lib/backend/env"),
  ]);
  const repository = new EventDemoTagRepository();
  const existingTag = (await repository.list()).find((tag) => tag.internalName === internalName);

  if (existingTag) {
    throw new Error(`An Event Demo tag named "${internalName}" already exists.`);
  }

  const tag = await new EventDemoTagService(repository).create({ internalName, sessionDurationMinutes: 60 });
  const baseUrl = getServerEnv().NEXT_PUBLIC_SITE_URL;
  console.log(JSON.stringify({ internalName: tag.internalName, publicCode: tag.publicCode, activationUrl: new URL(`/event/activate/${tag.publicCode}`, baseUrl).toString() }, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unable to create the Event Demo tag.";
  console.error(message);
  process.exitCode = 1;
});
