# Sprint 25N.1 — NFC and pets local foundation

The isolated worktree now maps the pre-existing `pets`, `nfc_tags`, and
`tag_activations` tables from migrations 0000, 0005, and 0007. The mapping is
read-only in this sprint: it creates no migration, emits no SQL, and changes no
remote database state.

`nfc_tags.public_id` and `pets.public_id` are the only customer-safe public
identifiers. Repositories always start with an `account_id` predicate. Internal
UUIDs are used only within server repositories and are stripped by services.

The foundation provides owner-scoped pet/tag reads, a separate owner-scoped
activation-date lookup, and safe DTOs. It does not
provide activation, assignment, reassignment, unassignment, a public profile
route, Lost Mode, or pet photo URLs. The canonical services for those actions
are still outside this isolated baseline and must be imported/reviewed before
Sprint 25N exposes any mutable action.
