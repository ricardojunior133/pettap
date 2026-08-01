import { describe, expect, it } from "vitest";

import { GET as cronGet, POST as cronPost, PUT as cronPut, createContactNotificationCronHandler } from "@/app/api/internal/contact-request-notifications/cron/route";
import { createContactNotificationWorkerHandler } from "@/app/api/internal/contact-request-notifications/process/route";
import type { ProcessPendingNotificationsResult } from "@/features/contact-request-notifications/process-pending-notifications";

const cronSecret = "local-cron-secret";
const manualSecret = "local-manual-secret";
const url = "https://pettap.test/api/internal/contact-request-notifications/cron";
const request = (authorization?: string) => new Request(url, { method: "GET", headers: authorization ? { authorization } : undefined });
const empty: ProcessPendingNotificationsResult = { claimed: 0, sent: 0, retryScheduled: 0, failed: 0, cancelled: 0 };

describe("contact notification Vercel Cron adapter", () => {
  it("accepts an authorized GET and returns safe aggregate counters", async () => {
    const handler = createContactNotificationCronHandler({ cronSecret, processPending: async () => ({ claimed: 4, sent: 1, retryScheduled: 1, failed: 1, cancelled: 1 }) });
    const response = await handler(request(`Bearer ${cronSecret}`));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true, processed: 4, sent: 1, retried: 1, failed: 1, cancelled: 1 });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(JSON.stringify(body)).not.toMatch(/email|recipient|finder|secret|html|text/i);
  });

  it("fails closed for absent configuration and malformed, empty, or invalid Bearer headers", async () => {
    const configured = createContactNotificationCronHandler({ cronSecret, processPending: async () => empty });
    const missing = createContactNotificationCronHandler({ cronSecret: undefined, processPending: async () => empty });
    await expect(missing(request(`Bearer ${cronSecret}`))).resolves.toMatchObject({ status: 503 });
    await expect(configured(request())).resolves.toMatchObject({ status: 401 });
    await expect(configured(request("Bearer "))).resolves.toMatchObject({ status: 401 });
    await expect(configured(request("Basic local-cron-secret"))).resolves.toMatchObject({ status: 401 });
    await expect(configured(request("Bearer invalid"))).resolves.toMatchObject({ status: 401 });
  });

  it("rejects POST and PUT without executing the worker", async () => {
    await expect(cronPost()).resolves.toMatchObject({ status: 405 });
    await expect(cronPut()).resolves.toMatchObject({ status: 405 });
    // The environment-backed GET is not called: it would require an actual secret.
    expect(typeof cronGet).toBe("function");
  });

  it("returns zero counts for an empty queue and a generic result for an unexpected exception", async () => {
    const emptyHandler = createContactNotificationCronHandler({ cronSecret, processPending: async () => empty });
    await expect((await emptyHandler(request(`Bearer ${cronSecret}`))).json()).resolves.toEqual({ ok: true, processed: 0, sent: 0, retried: 0, failed: 0, cancelled: 0 });
    const failing = createContactNotificationCronHandler({ cronSecret, processPending: async () => { throw new Error("owner@example.test must not be exposed"); } });
    const response = await failing(request(`Bearer ${cronSecret}`));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });

  it("keeps manual and cron credentials strictly separate", async () => {
    const cron = createContactNotificationCronHandler({ cronSecret, processPending: async () => empty });
    const manual = createContactNotificationWorkerHandler({ workerSecret: manualSecret, processPending: async () => empty });
    await expect(cron(request(`Bearer ${manualSecret}`))).resolves.toMatchObject({ status: 401 });
    await expect(manual(new Request(url, { method: "POST", headers: { authorization: `Bearer ${cronSecret}` } }))).resolves.toMatchObject({ status: 401 });
  });

  it("shares the atomic claim outcome between concurrent cron and manual triggers", async () => {
    let claimed = false;
    let deliveries = 0;
    const processPending = async (): Promise<ProcessPendingNotificationsResult> => {
      if (claimed) return empty;
      claimed = true;
      await Promise.resolve(); // represent a provider that has started after the atomic database claim
      deliveries += 1;
      return { claimed: 1, sent: 1, retryScheduled: 0, failed: 0, cancelled: 0 };
    };
    const cron = createContactNotificationCronHandler({ cronSecret, processPending });
    const manual = createContactNotificationWorkerHandler({ workerSecret: manualSecret, processPending });
    const [cronResponse, manualResponse] = await Promise.all([
      cron(request(`Bearer ${cronSecret}`)),
      manual(new Request(url, { method: "POST", headers: { authorization: `Bearer ${manualSecret}` } })),
    ]);
    const counts = [await cronResponse.json(), await manualResponse.json()].map((body) => body.processed);
    expect(deliveries).toBe(1);
    expect(counts.sort()).toEqual([0, 1]);
  });
});
