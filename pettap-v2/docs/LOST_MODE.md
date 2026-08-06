# Lost Mode

Lost Mode is represented by an active `lost_reports` record. `status = active` is the single source of truth; resolving the report changes it to `resolved` and preserves the history. The JSON `details` object stores only last-seen time, approximate area, and an optional public message.

The service enforces one active report per pet transactionally and checks pet ownership for every mutation. Resolving an active alert returns an explicit result: `resolved`, `already-resolved`, or a safe not-found error for an inaccessible report. This makes repeated submissions idempotent and gives the owner accessible feedback instead of silently failing. No GPS, real-time tracking, or external notifications are implemented.

Public rescue and “I Found This Pet” remain intentionally unavailable while Coming Soon protection is enabled. A future launch sprint must add a privacy-reviewed public DTO, persisted finder-report model, durable rate limiting, and schema-supported notification state.
