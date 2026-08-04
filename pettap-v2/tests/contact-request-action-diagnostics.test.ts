import { describe, expect, it } from "vitest";

import {
  runContactRequestAction,
  type ContactRequestActionDependencies,
  type ContactRequestSafeFailureLog,
} from "@/features/contact-requests/actions/contact-request-action-handler";
import { ContactRequestError } from "@/features/contact-requests/services/contact-request-service";

const privateValues = { name: "Private Finder", email: "finder@example.test", message: "Private message", publicCode: "PT_private" };

function form(overrides: Record<string, string> = {}) {
  const values = { publicCode: privateValues.publicCode, finderName: privateValues.name, finderEmail: privateValues.email, message: privateValues.message, consent: "accepted", ...overrides };
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function setup(behavior: "success" | "lost" | "persistence" | "notification" = "success") {
  const logs: ContactRequestSafeFailureLog[] = [];
  let creates = 0;
  let notifications = 0;
  const dependencies: ContactRequestActionDependencies = {
    createCorrelationId: () => "correlation-test",
    isSameOriginRequest: async () => true,
    requestHeaders: async () => new Headers(),
    logFailure: (entry) => logs.push(entry),
    createService: (diagnostics) => ({
      recordInvalidAttempt: async () => undefined,
      create: async () => {
        if (behavior === "lost") { const error = new ContactRequestError("UNAVAILABLE"); diagnostics({ stage: "lost_report_resolution", error }); throw error; }
        if (behavior === "persistence") { const error = new Error("database failure"); diagnostics({ stage: "contact_request_persistence", error }); throw error; }
        creates += 1;
        if (behavior === "notification") { notifications += 1; diagnostics({ stage: "notification_enqueue", error: new Error("queue failure") }); }
        else notifications += 1;
        return { accepted: true };
      },
    }),
  };
  return { dependencies, logs, counts: () => ({ creates, notifications }) };
}

describe("contact request action diagnostics", () => {
  it("keeps validation failures generic while recording a correlation-safe stage", async () => {
    const test = setup();
    await expect(runContactRequestAction({ ok: false, message: "" }, form({ consent: "" }), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "action_input_parsing", errorClass: "validation_error" }]);
  });

  it("records an origin denial without inspecting or logging the submitted payload", async () => {
    const test = setup();
    test.dependencies.isSameOriginRequest = async () => false;
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "same_origin_validation", errorClass: "unknown_error" }]);
    expect(JSON.stringify(test.logs)).not.toMatch(/Private Finder|finder@example|Private message|PT_private/);
  });

  it("records request context failures before the service is initialized", async () => {
    const test = setup();
    test.dependencies.requestHeaders = async () => { throw new Error("headers unavailable"); };
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "request_context_resolution", errorClass: "unknown_error" }]);
  });

  it("records service construction failures before invocation", async () => {
    const test = setup();
    test.dependencies.createService = () => { throw new Error("provider initialization failed"); };
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "service_initialization", errorClass: "unknown_error" }]);
  });

  it("records an invocation failure when no service stage has reported it", async () => {
    const test = setup();
    test.dependencies.createService = () => ({ recordInvalidAttempt: async () => undefined, create: async () => { throw new Error("unexpected invocation failure"); } });
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "service_invocation", errorClass: "unknown_error" }]);
  });

  it("records a malformed FormData reader without exposing submitted values", async () => {
    const test = setup();
    const malformed = { get: () => { throw new Error("form reader failed"); } } as unknown as FormData;
    await expect(runContactRequestAction({ ok: false, message: "" }, malformed, test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "action_input_parsing", errorClass: "unknown_error" }]);
  });

  it("identifies a missing Lost report without returning details publicly", async () => {
    const test = setup("lost");
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "lost_report_resolution", errorClass: "domain_error" }]);
  });

  it("identifies persistence failures without emitting finder or tag data", async () => {
    const test = setup("persistence");
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: false, message: "We couldn't submit your request." });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "contact_request_persistence", errorClass: "unknown_error" }]);
    expect(JSON.stringify(test.logs)).not.toMatch(/Private Finder|finder@example|Private message|PT_private/);
  });

  it("keeps notification enqueue failures non-fatal and logs them safely", async () => {
    const test = setup("notification");
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: true, message: "Your message has been sent to the pet owner." });
    expect(test.counts()).toEqual({ creates: 1, notifications: 1 });
    expect(test.logs).toEqual([{ correlationId: "correlation-test", stage: "notification_enqueue", errorClass: "unknown_error" }]);
  });

  it("creates exactly one contact request and notification in the successful path", async () => {
    const test = setup();
    await expect(runContactRequestAction({ ok: false, message: "" }, form(), test.dependencies)).resolves.toEqual({ ok: true, message: "Your message has been sent to the pet owner." });
    expect(test.counts()).toEqual({ creates: 1, notifications: 1 });
    expect(test.logs).toEqual([]);
  });
});
