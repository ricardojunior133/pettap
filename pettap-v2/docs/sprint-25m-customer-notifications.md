# Sprint 25M — Customer notifications

## Scope

`/account/notifications` is a private, server-rendered order-update history for
the authenticated customer. It uses the existing `transactional_notifications`
ledger and does not send, retry, or otherwise change email delivery.

## Architecture

```
session → CustomerNotificationService → CustomerNotificationRepository → orders + transactional_notifications
```

The repository joins notifications to `orders` and applies the authenticated
account predicate to `orders.account_id`. A notification is never looked up by
its public order number alone, nor by a browser-supplied account, customer, or
order ID.

## Public data contract

The UI receives only `type`, `title`, `description`, `orderNumber`, `status`,
`createdAt`, and optional `sentAt`. The DTO intentionally omits notification
and order IDs, account/customer IDs, recipient email, provider, provider IDs,
attempts, errors, payloads, and HTML/text templates.

Known transactional events are mapped to customer wording: payment received,
production started, printed, packed, shipped, delivered, and order cancelled.
Unknown internal types are represented as the neutral `Order update` label.
Delivery states are mapped to `Sent`, `Processing`, `Failed`, or `Not sent`.
Failed records never expose provider error text.

## Preferences

Essential order updates are always on and cannot be disabled. The isolated
worktree has no versioned account-level persistence for optional communication
preferences. Consequently the page shows an explanatory state and no toggles
or Server Action writes. A future approved migration and a versioned account
preference model are required before optional settings can be editable.

## Pagination and accessibility

History is newest-first with server pagination (12 rows per page). It has a
loading skeleton, empty and safe error states, labelled pagination, text
badges, visible focus styles, and no status communicated only by colour.

## Operational boundaries

No email is sent during this feature or its tests. No migration, database
change, remote write, deployment, push, checkout, Stripe, webhook, Event Demo,
or provider code is changed.
