export const eventDemoAuditEvents = [
  "event_demo.tag_created",
  "event_demo.tags_created_batch",
  "event_demo.session_started",
  "event_demo.photo_uploaded",
  "event_demo.session_expired",
  "event_demo.profile_created",
  "event_demo.profile_viewed",
  "event_demo.tag_reset",
  "event_demo.tag_enabled",
  "event_demo.tag_disabled",
  "event_demo.cleanup_requested",
  "event_demo.cleanup_completed",
  "event_demo.cleanup_failed",
  "event_demo.tags_exported",
  "event_demo.leads_exported",
  "event_demo.lead_created",
  "event_demo.error",
] as const;

export type EventDemoAuditEvent = (typeof eventDemoAuditEvents)[number];
