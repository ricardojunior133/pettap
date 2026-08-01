import { describe, expect, it } from "vitest";

import { createContactNotificationWorkerHandler, GET } from "@/app/api/internal/contact-request-notifications/process/route";
import { isContactNotificationWorkerAuthorized } from "@/features/contact-request-notifications/internal-worker-auth";
import { summarizeNotificationProcessing } from "@/features/contact-request-notifications/process-pending-notifications";

const secret = "local-test-worker-secret";
const url = "https://pettap.test/api/internal/contact-request-notifications/process";
const request = (authorization?: string) => new Request(url, { method: "POST", headers: authorization ? { authorization } : undefined });

describe("contact notification internal worker route", () => {
  it("accepts only POST and prevents caching", async () => {
    const response = await GET();
    expect(response.status).toBe(405);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });

  it("fails closed for missing configuration, missing credentials, and invalid credentials", async () => {
    const worker = async () => ({ claimed: 0, sent: 0, retryScheduled: 0, failed: 0, cancelled: 0 });
    const unconfigured = createContactNotificationWorkerHandler({ workerSecret: undefined, processPending: worker });
    const configured = createContactNotificationWorkerHandler({ workerSecret: secret, processPending: worker });
    await expect(unconfigured(request(`Bearer ${secret}`))).resolves.toMatchObject({ status: 401 });
    await expect(configured(request())).resolves.toMatchObject({ status: 401 });
    await expect(configured(request("Bearer invalid"))).resolves.toMatchObject({ status: 401 });
    expect(isContactNotificationWorkerAuthorized("Bearer local-test-worker-secrex", secret)).toBe(false);
  });

  it("returns only aggregate counters for an authorized run", async () => {
    const worker = createContactNotificationWorkerHandler({ workerSecret: secret, processPending: async () => ({ claimed: 3, sent: 1, retryScheduled: 1, failed: 1, cancelled: 0 }) });
    const response = await worker(request(`Bearer ${secret}`));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true, processed: 3, sent: 1, retried: 1, failed: 1, cancelled: 0 });
    expect(JSON.stringify(body)).not.toMatch(/email|finder|recipient|html|text|secret/i);
  });

  it("returns zero counters for an empty queue and a generic response for unexpected failures", async () => {
    const emptyWorker = createContactNotificationWorkerHandler({ workerSecret: secret, processPending: async () => ({ claimed: 0, sent: 0, retryScheduled: 0, failed: 0, cancelled: 0 }) });
    await expect((await emptyWorker(request(`Bearer ${secret}`))).json()).resolves.toMatchObject({ ok: true, processed: 0 });
    const failingWorker = createContactNotificationWorkerHandler({ workerSecret: secret, processPending: async () => { throw new Error("owner@example.test should never leave this boundary"); } });
    const response = await failingWorker(request(`Bearer ${secret}`));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });

  it("summarizes only claimed outcomes without notification content", () => {
    expect(summarizeNotificationProcessing(["sent", "retry_scheduled", "failed", "cancelled", "skipped"])).toEqual({ claimed: 4, sent: 1, retryScheduled: 1, failed: 1, cancelled: 1 });
  });
});
