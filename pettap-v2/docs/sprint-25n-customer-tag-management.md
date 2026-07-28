# Sprint 25N — Customer tag management preflight

## Scope and decision

This worktree cannot safely implement `/account/tags` yet. The local migration
history records the underlying NFC domain, but the isolated TypeScript schema
and repositories needed to read it are absent. Sprint 25N explicitly forbids
schema changes, new migrations, and invented activation flows, so no tag UI,
Server Action, or write operation is introduced.

## Versioned database evidence

`db/migrations/0000_chilly_nebula.sql` defines:

- `nfc_tags` with a unique `public_id`, nullable `account_id`, nullable
  `pet_id`, and canonical `tag_status`;
- `pets` with a unique `public_id` and owning `account_id`;
- `tag_activations` with `tag_id`, `account_id`, and status.

The migration journal includes `0000` through `0011`, and `0001` enables RLS
and owner-scoped policies for NFC tags, activations, and pets. The public-safe
identifier intended for an NFC resolver is `nfc_tags.public_id`; it must be the
only identifier allowed in a customer URL when this module is implemented.

## Missing local application foundation

The isolated worktree's `db/schema/core.ts` exports only accounts, profiles,
and audit logs. It does not expose Drizzle definitions for `nfc_tags`, `pets`,
`tag_activations`, `lost_reports`, or the supporting pet-photo/public-profile
tables. The following source modules are likewise not versioned in this
worktree:

- NFC tag repository and owner-scoped service;
- pet repository and public-identifier access service;
- canonical PublicTagService and `/pet/[tagId]` route;
- Lost Mode repository, service, schema, and actions.

Adding any of these mappings or modules would change the local schema/code
baseline, contrary to this sprint's explicit restriction. Using raw SQL or a
browser-side query instead would be less safe and would bypass the established
Repository → Service → Server Action structure.

## Canonical status and action evidence

The migration's canonical tag state is `tag_status`; the existing original
service implementation recognises `unassigned`, `active`, `suspended`, `lost`,
and `retired`. Its only reusable write is physical-code activation from
`unassigned` to `active`, using internal UUIDs and a physical activation code.
That service is absent from this worktree and its input is incompatible with
the customer-facing safe-identifier rule. It must not be copied or exposed
without a dedicated import/review sprint.

No owner-scoped reassignment or unassignment rule is versioned here. Lost Mode
also cannot be presented because its owner-scoped service and its supporting
tables are absent. Therefore all writes are deliberately blocked.

## Required next step

Run a dedicated, no-remote-change foundation import sprint before resuming tag
management. It must version the existing NFC/pet Drizzle mappings and the
minimal owner-scoped read services, then review physical activation,
reassignment, unassignment, Lost Mode, and the canonical public resolver
together. Only after that can Sprint 25N implement customer routes without
creating an unsafe parallel flow.
