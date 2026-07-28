# Sprint 25N.2 — NFC domain services reconciliation

## Outcome

No NFC domain service was imported. This is an intentional security decision:
the local candidates are untracked in the original workspace and lack an
auditable commit origin; their dependencies are absent from the isolated
baseline; and their activation contract conflicts with the customer-safe public
identifier and no-internal-ID requirements.

The read-only NFC/pets foundation from Sprint 25N.1 remains intact. It is the
only approved basis for future private list/detail pages.

## Actions supported

None are added in this sprint. Reads remain owner-scoped through account ID,
and no new Server Action, write repository method, public route, or UI is
introduced.

## Actions blocked

- physical NFC activation;
- tag-to-pet assignment, reassignment, and unassignment;
- public `/pet/[tagId]` resolver;
- Lost Mode enable/disable;
- any status transition beyond the existing read-only mapping.

## Security boundaries preserved

No UUID, token, token hash, activation code, internal serial, or admin metadata
is introduced to browser-facing code. No migration, remote write, deployment,
push, email delivery, Stripe, Checkout, Admin, Event Demo, or RLS change occurs.
