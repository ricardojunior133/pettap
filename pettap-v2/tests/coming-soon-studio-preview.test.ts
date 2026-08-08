import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "../proxy";

const originalEnvironment = {
  NODE_ENV: process.env.NODE_ENV,
  PETTAP_COMING_SOON_MODE: process.env.PETTAP_COMING_SOON_MODE,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

function setEnvironment(environment: Partial<typeof originalEnvironment>) {
  const mutableEnvironment = process.env as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(environment)) {
    if (value === undefined) delete mutableEnvironment[key];
    else mutableEnvironment[key] = value;
  }
}

afterEach(() => setEnvironment(originalEnvironment));

describe("Coming Soon Studio gate", () => {
  it("keeps Studio and checkout blocked in production", async () => {
    setEnvironment({ NODE_ENV: "production", PETTAP_COMING_SOON_MODE: undefined, VERCEL_ENV: "production" });
    await expect(proxy(new NextRequest("https://pettap.example/studio"))).resolves.toMatchObject({ status: 307, headers: expect.anything() });
    await expect(proxy(new NextRequest("https://pettap.example/checkout"))).resolves.toMatchObject({ status: 307, headers: expect.anything() });
  });

  it("allows Studio only in Vercel Preview and local development", async () => {
    setEnvironment({ NODE_ENV: "production", PETTAP_COMING_SOON_MODE: undefined, VERCEL_ENV: "preview" });
    await expect(proxy(new NextRequest("https://preview.example/studio?collection=bloom"))).resolves.toMatchObject({ status: 200 });
    await expect(proxy(new NextRequest("https://preview.example/studio/models/bloom/lotus.png"))).resolves.toMatchObject({ status: 200 });

    setEnvironment({ NODE_ENV: "development", PETTAP_COMING_SOON_MODE: undefined, VERCEL_ENV: undefined });
    await expect(proxy(new NextRequest("http://localhost:3000/studio"))).resolves.toMatchObject({ status: 200 });
  });

  it("preserves the webhook exception and production Coming Soon root", async () => {
    setEnvironment({ NODE_ENV: "production", PETTAP_COMING_SOON_MODE: undefined, VERCEL_ENV: "production" });
    await expect(proxy(new NextRequest("https://pettap.example/api/stripe/webhook"))).resolves.toMatchObject({ status: 200 });
    await expect(proxy(new NextRequest("https://pettap.example/"))).resolves.toMatchObject({ status: 200 });
  });
});
