# Sprint 25M — Customer notifications report

## Result

The Customer Portal now has a read-only `/account/notifications` history of
transactional updates for the authenticated account's orders.

## Audit findings

The existing transactional notification infrastructure defines these mandatory
events: `payment_received`, `production_started`, `printed`, `packed`,
`shipped`, `delivered`, and `order_cancelled`. They are contractual order
updates, not optional marketing communications.

The worktree contains the already-versioned `0010_transactional_notification_history.sql`
migration. Its TypeScript Drizzle declaration was missing locally, so the
matching enum and table mapping were restored in `db/schema/commerce.ts` solely
to permit safe read queries. No SQL was generated or applied, and no database
schema changed remotely.

No optional account communication preference has a versioned persistence model
in this worktree. The previous Event Demo marketing consent is not an account
communication preference and is intentionally not reused. The portal therefore
does not show editable optional toggles.

## Answers

1. **Does the customer see only their notifications?** Yes. Reads join each notification to an order and scope by the authenticated `orders.account_id`.
2. **Are provider details or internal IDs exposed?** No.
3. **Is the recipient email exposed?** No.
4. **Are internal errors exposed?** No. Failed delivery shows neutral customer wording.
5. **Are HTML or TXT templates sent to the UI?** No.
6. **Can transactional notifications be disabled?** No.
7. **Which optional preferences are editable?** None; no real, versioned account preference persistence was found in this worktree.
8. **Does the page paginate?** Yes, server-side at 12 records per page, newest first.
9. **Was a real email sent?** No.
10. **Was Checkout changed?** No.
11. **Was Stripe changed?** No.
12. **Were webhooks changed?** No.
13. **Was the remote schema changed?** No. A local Drizzle mapping was aligned with existing migration 0010 only.
14. **Was a migration created or executed?** No.
15. **Were remote data changed?** No.
16. **Recommended next step:** add optional communication preferences only after an approved schema and migration provide an account-owned, auditable persistence model.

## Coverage and quality gates

Local fakes cover authenticated owner scoping, rejected unauthenticated reads,
pagination, newest-first query ordering, DTO field omission, known and unknown
event mapping, failed delivery privacy, and the absence of fictitious optional
controls. No test connects to a remote database.
