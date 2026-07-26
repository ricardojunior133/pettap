export type EventDemoErrorCode =
  | "tag_not_found"
  | "tag_disabled"
  | "tag_unavailable"
  | "active_session_exists"
  | "session_not_found"
  | "invalid_session_token"
  | "session_expired"
  | "invalid_state_transition"
  | "consent_required"
  | "marketing_email_required"
  | "cleanup_failed"
  | "photo_pending";

export class EventDemoDomainError extends Error {
  constructor(public readonly code: EventDemoErrorCode, message = "The Event Demo request could not be completed.") {
    super(message);
  }
}
