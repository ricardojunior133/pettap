# Backend Integration Plan

## Entities

Owners, accounts, pets, emergency contacts, medical records, vaccinations, NFC tags, tag activations, public profiles, lost reports, activities and audit logs should be relational entities with owner-scoped foreign keys.

## Boundaries

Authentication establishes owner identity. Server-side repositories enforce ownership. NFC tag validation runs only on the server. Public profile lookup returns the privacy-filtered projection. Photo uploads use signed URLs and malware/content validation. Notifications, audit writes and contact actions are queued and rate-limited.

## Compliance

Define retention periods, deletion requests, consent history, profile visibility defaults and incident logging before production data is collected.
