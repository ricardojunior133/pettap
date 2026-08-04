import "server-only";

import { createContactRequestSchema } from "../schemas/contact-request";
import {
  ContactRequestError,
  type ContactRequestDiagnosticListener,
  type ContactRequestFailureStage,
  type ContactRequestService,
} from "../services/contact-request-service";

export type ContactRequestActionState = { ok: boolean; message: string };
export type ContactRequestSafeFailureLog = {
  correlationId: string;
  stage: ContactRequestFailureStage;
  errorClass: "validation_error" | "domain_error" | "unknown_error";
};

export type ContactRequestActionDependencies = {
  createService: (diagnostics: ContactRequestDiagnosticListener) => Pick<ContactRequestService, "create" | "recordInvalidAttempt">;
  isSameOriginRequest: () => Promise<boolean>;
  requestHeaders: () => Promise<Headers>;
  createCorrelationId: () => string;
  logFailure: (entry: ContactRequestSafeFailureLog) => void;
};

const initialFailure: ContactRequestActionState = { ok: false, message: "We couldn't submit your request." };
const success: ContactRequestActionState = { ok: true, message: "Your message has been sent to the pet owner." };

function fingerprint(requestHeaders: Headers) {
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip")?.trim() || "anonymous";
}

function safeErrorClass(error: unknown): ContactRequestSafeFailureLog["errorClass"] {
  if (error instanceof ContactRequestError) return "domain_error";
  if (error instanceof Error && error.name === "ZodError") return "validation_error";
  return "unknown_error";
}

/** Runs a public submission while emitting only correlation-safe operational diagnostics. */
export async function runContactRequestAction(
  _previous: ContactRequestActionState,
  formData: FormData,
  dependencies: ContactRequestActionDependencies,
): Promise<ContactRequestActionState> {
  const correlationId = dependencies.createCorrelationId();
  let stage: ContactRequestFailureStage = "unknown";
  const diagnostics: ContactRequestDiagnosticListener = (diagnostic) => {
    stage = diagnostic.stage;
    // Notification enqueue failures are intentionally non-fatal after persistence.
    if (diagnostic.stage === "notification_enqueue") {
      dependencies.logFailure({ correlationId, stage, errorClass: safeErrorClass(diagnostic.error) });
    }
  };

  try {
    if (!await dependencies.isSameOriginRequest()) {
      dependencies.logFailure({ correlationId, stage: "unknown", errorClass: "unknown_error" });
      return initialFailure;
    }
    if (String(formData.get("website") ?? "").trim()) {
      await dependencies.createService(diagnostics).recordInvalidAttempt();
      return success;
    }

    let input;
    try {
      input = createContactRequestSchema.parse({
        publicCode: formData.get("publicCode"),
        finderName: formData.get("finderName"),
        finderEmail: formData.get("finderEmail"),
        message: formData.get("message"),
        consent: formData.get("consent"),
      });
    } catch (error) {
      dependencies.logFailure({ correlationId, stage: "validation", errorClass: safeErrorClass(error) });
      return initialFailure;
    }

    await dependencies.createService(diagnostics).create(input, fingerprint(await dependencies.requestHeaders()));
    return success;
  } catch (error) {
    dependencies.logFailure({ correlationId, stage, errorClass: safeErrorClass(error) });
    return initialFailure;
  }
}
