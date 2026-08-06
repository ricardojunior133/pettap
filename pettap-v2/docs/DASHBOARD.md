# Operational Dashboard

The private dashboard reads real account-scoped pet, tag, and active lost-report counts. It deliberately avoids fabricated metrics and shows a Lost Mode alert only when active reports exist.

Pet readiness is calculated in `features/dashboard/readiness.ts`: photo 20%, emergency contact 25%, active tag 35%, and optional medical profile 20%. It is never stored in the database.

Current limitations: the dashboard does not yet display a timeline or notification read state because `activity_logs` and `notifications` lack a schema-backed UI contract for sensitive metadata and unread status. Future query indexes worth reviewing include `(pet_id, status)` on lost reports and `(account_id, created_at)` on activity logs.
