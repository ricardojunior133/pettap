# Administrative data privacy

Administrative access is permission-scoped and server-only. Data minimization rules:

- Customer lists mask email and exclude address, phone and health data.
- Pet views display medical-information presence only.
- NFC views never include activation codes, code hashes or internal authentication data.
- Storage remains private; signed URLs are short-lived and generated only after resource resolution.
- Timelines use safe titles and identifiers rather than raw activity or audit metadata.
- The browser never chooses the actor account, permission, storage path or ownership relation.

The current public rescue page is still backed by the established mock rescue foundation. Production rescue resolution against live NFC status, including the neutral response for suspended tags, remains a separately gated integration and must be completed before exposing live tags publicly.
