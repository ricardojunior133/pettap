# Backend

UI never queries Supabase directly. Future services depend on repository contracts and validate input with shared Zod schemas. Backend errors use typed codes for authorization, validation, conflict, storage, database and unexpected failures. Audit writes are required for tag activation, profile edits and future privileged actions.
