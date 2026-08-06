import { describe, expect, it } from "vitest";

import { serverEnvSchema } from "@/lib/backend/env";

const requiredEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  DATABASE_URL: "postgresql://user:password@localhost:5432/pettap",
  NEXT_PUBLIC_SITE_URL: "https://pettap.test",
  NEXT_PUBLIC_CONTACT_EMAIL: "support@pettap.test",
};

describe("server environment schema", () => {
  it("accepts an unconfigured transactional provider", () => {
    expect(serverEnvSchema.parse(requiredEnvironment)).not.toHaveProperty("RESEND_API_KEY");
  });

  it("accepts the provider sender formats used by the delivery adapter", () => {
    expect(serverEnvSchema.parse({
      ...requiredEnvironment,
      RESEND_API_KEY: "test-provider-key",
      EMAIL_FROM: "PetTap <notifications@pettap.test>",
      EMAIL_REPLY_TO: "support@pettap.test",
    })).toMatchObject({ EMAIL_FROM: "PetTap <notifications@pettap.test>" });
  });

  it("rejects incomplete or malformed provider configuration", () => {
    expect(() => serverEnvSchema.parse({ ...requiredEnvironment, RESEND_API_KEY: " " })).toThrow();
    expect(() => serverEnvSchema.parse({ ...requiredEnvironment, EMAIL_FROM: "PetTap <invalid>" })).toThrow();
    expect(() => serverEnvSchema.parse({ ...requiredEnvironment, EMAIL_REPLY_TO: "invalid" })).toThrow();
  });
});
