import { describe, expect, it } from "vitest";

import { loginSchema, registrationSchema } from "@/features/auth/schemas/auth";
import { ensureAccountProfile, resolveDisplayName } from "@/features/owner/services/profile-service";
import type { OwnerRepository } from "@/features/owner/repositories/owner-repository";

describe("auth validation", () => {
  it("validates login credentials", () => {
    expect(loginSchema.parse({ email: "owner@example.com", password: "password123" })).toEqual({
      email: "owner@example.com",
      password: "password123",
    });
  });

  it("requires matching registration passwords", () => {
    expect(() => registrationSchema.parse({
      displayName: "Alex",
      email: "alex@example.com",
      password: "password123",
      passwordConfirmation: "different-password",
    })).toThrow();
  });

  it("uses email local part when no display name is available", () => {
    expect(resolveDisplayName({ email: "charlie.owner@example.com" })).toBe("charlie.owner");
  });
});

describe("account profile bootstrap", () => {
  it("delegates the same Auth UUID on repeat calls without generating a new identity", async () => {
    const calls: string[] = [];
    const repository: OwnerRepository = {
      async ensureAccountProfile({ authUserId, displayName }) {
        calls.push(authUserId);
        return { accountId: authUserId, displayName, phone: null };
      },
      async findProfileByAccountId() {
        return null;
      },
    };

    await ensureAccountProfile({ authUserId: "dc4f804f-f6c0-49cb-b3a5-b2d7c4b9c81b", email: "alex@example.com" }, repository);
    await ensureAccountProfile({ authUserId: "dc4f804f-f6c0-49cb-b3a5-b2d7c4b9c81b", email: "alex@example.com" }, repository);

    expect(calls).toEqual([
      "dc4f804f-f6c0-49cb-b3a5-b2d7c4b9c81b",
      "dc4f804f-f6c0-49cb-b3a5-b2d7c4b9c81b",
    ]);
  });
});
