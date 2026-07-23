# Security Preparation

- Enforce authentication and owner-to-record authorization on every private server action.
- Resolve public tags through opaque public IDs; never expose sequential database identifiers.
- Keep `NEXT_PUBLIC_*` values non-sensitive and validate server environment variables at boot.
- Do not ship mock adapters or personal fixtures to production services.
- Rate-limit public profile lookup and contact actions; record security-relevant activity in `AuditLog`.
- Implement deletion, retention and export workflows before collecting owner or pet data.
