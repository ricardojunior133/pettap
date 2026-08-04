import "server-only";

import { createContactRequestSchema } from "../schemas/contact-request";
import {
  ContactRequestError,
  type ContactRequestDiagnosticListener,
  type ContactRequestFailureStage,
  type ContactRequestServiceInitializationStage,
  type ContactRequestService,
} from "../services/contact-request-service";

export type ContactRequestActionState = { ok: boolean; message: string };
export type ContactRequestActionFailureStage =
  | ContactRequestFailureStage
  | ContactRequestServiceInitializationStage
  | "action_input_parsing"
  | "same_origin_validation"
  | "request_context_resolution"
  | "service_initialization"
  | "service_invocation"
  | "unknown_pre_service";
export type ContactRequestSafeFailureLog = {
  correlationId: string;
  stage: ContactRequestActionFailureStage;
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
  let stage: ContactRequestActionFailureStage = "unknown_pre_service";
  const diagnostics: ContactRequestDiagnosticListener = (diagnostic) => {
    stage = diagnostic.stage;
    // Notification enqueue failures are intentionally non-fatal after persistence.
    if (diagnostic.stage === "notification_enqueue") {
      dependencies.logFailure({ correlationId, stage, errorClass: safeErrorClass(diagnostic.error) });
    }
  };

  try {
    try {
      if (!await dependencies.isSameOriginRequest()) {
        dependencies.logFailure({ correlationId, stage: "same_origin_validation", errorClass: "unknown_error" });
        return initialFailure;
      }
    } catch (error) {
      dependencies.logFailure({ correlationId, stage: "same_origin_validation", errorClass: safeErrorClass(error) });
      return initialFailure;
    }

    let input;
    try {
      if (String(formData.get("website") ?? "").trim()) {
        let honeypotService;
        try { honeypotService = dependencies.createService(diagnostics); } catch (error) {
          dependencies.logFailure({ correlationId, stage: "service_initialization", errorClass: safeErrorClass(error) });
          return initialFailure;
        }
        await honeypotService.recordInvalidAttempt();
        return success;
      }
      input = createContactRequestSchema.parse({
        publicCode: formData.get("publicCode"),
        finderName: formData.get("finderName"),
        finderEmail: formData.get("finderEmail"),
        message: formData.get("message"),
        consent: formData.get("consent"),
      });
    } catch (error) {
      dependencies.logFailure({ correlationId, stage: "action_input_parsing", errorClass: safeErrorClass(error) });
      return initialFailure;
    }

    let actorFingerprint: string;
    try { actorFingerprint = fingerprint(await dependencies.requestHeaders()); } catch (error) {
      dependencies.logFailure({ correlationId, stage: "request_context_resolution", errorClass: safeErrorClass(error) });
      return initialFailure;
    }

    let service;
    try { service = dependencies.createService(diagnostics); } catch (error) {
      dependencies.logFailure({ correlationId, stage: "service_initialization", errorClass: safeErrorClass(error) });
      return initialFailure;
    }

    stage = "service_invocation";
    await service.create(input, actorFingerprint);
    return success;
  } catch (error) {
    dependencies.logFailure({ correlationId, stage, errorClass: safeErrorClass(error) });
    return initialFailure;
  }
}
