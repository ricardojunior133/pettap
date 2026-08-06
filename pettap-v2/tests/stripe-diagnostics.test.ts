import { describe, expect, it, vi } from "vitest";

import { getStripeDiagnostics, type StripeDiagnosticsClient } from "@/lib/backend/stripe-diagnostics";

describe("Stripe diagnostics", () => {
  it("uses the current platform account API with an injected client", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_diagnostics");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_diagnostics");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pettap.test");
    const retrieveCurrent = vi.fn().mockResolvedValue({ id: "acct_diagnostics" });
    const client = { accounts: { retrieveCurrent } } as unknown as StripeDiagnosticsClient;

    await expect(getStripeDiagnostics(client)).resolves.toEqual({
      configured: true,
      keyMode: "test",
      accountId: "acct_diagnostics",
    });
    expect(retrieveCurrent).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
  });
});
