# Customer support access

## Search

`/admin/customers` is protected by `customers.read`. It uses server-side pagination, defaults to 20 results, caps requests at 100 and accepts normalized searches by display name, commerce email cache, account UUID, pet name or exact NFC public ID. Text queries shorter than three characters are rejected before querying.

The listing exposes only display name, masked email, creation date, pet count and tag count. It does not expose addresses, phone numbers, medical payloads, activation secrets, signed URLs or audit metadata.

## Account email

Supabase Auth is the authoritative email source. The commerce email is used only as a server-side search cache and is compared on account detail. A mismatch is shown for operational review but is never corrected automatically.

## Detail page

Customer detail shows a minimal account overview, pet summaries, tag summaries and sanitized operational context. It does not permit account deletion, password resets, impersonation or direct Auth-email changes.
