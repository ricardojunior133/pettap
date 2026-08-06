import { afterEach, describe, expect, it } from "vitest";

import { clearRateLimitStateForTests, checkRateLimit, clientRequestKey } from "@/lib/security/rate-limit";
import nextConfig from "../next.config";

afterEach(() => clearRateLimitStateForTests());

describe("production hardening", () => {
  it("rate limits sensitive request keys without storing request data", () => {
    expect(checkRateLimit("auth:login:127.0.0.1", { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit("auth:login:127.0.0.1", { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit("auth:login:127.0.0.1", { limit: 2, windowMs: 60_000 }).allowed).toBe(false);
    expect(clientRequestKey(new Headers({ "x-forwarded-for": "203.0.113.2, proxy" }), "checkout:start")).toBe("checkout:start:203.0.113.2");
  });

  it("ships baseline security headers and a CSP", async () => {
    const rules = await nextConfig.headers?.();
    const headers = rules?.[0]?.headers ?? [];
    const lookup = (key: string) => headers.find((header) => header.key === key)?.value;
    expect(lookup("Content-Security-Policy")).toContain("object-src 'none'");
    expect(lookup("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(lookup("X-Content-Type-Options")).toBe("nosniff");
    expect(lookup("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(lookup("X-Frame-Options")).toBe("DENY");
  });
});
