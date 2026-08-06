# NFC Tags

## Activation

An authenticated owner enters the existing `nfc_tags.public_id` printed with a physical tag and selects one of their own pets. The server allows activation only from `unassigned` to `active`, assigns both account and pet, and inserts a `tag_activations` record in one transaction.

## Limitations

The current schema does not have a separate secret activation code, scan telemetry, deactivation date, or a public-contact privacy policy. The public ID is currently used as the supplied physical code. Production public rescue profiles remain gated by the Coming Soon proxy until the platform launch and must not expose contacts or medical information until a schema-backed consent model exists.

NFC is an identification technology, not GPS tracking.
