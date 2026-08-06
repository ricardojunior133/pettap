# Storage

Pet photos use a private Supabase Storage bucket and authenticated, server-side signed URLs. The detailed policy, ownership, processing, and operational guidance lives in [Private Pet Photo Storage](./security/storage.md).

Avatars and tag assets remain out of scope. Public URLs, browser-controlled object paths, and anonymous bucket access must not be introduced.
