# PetTap

PetTap is a premium NFC pet-tag platform. The public production experience is currently a protected Coming Soon site; the owner platform remains private while the product is completed.

## Product surfaces

| Surface | Status | Notes |
| --- | --- | --- |
| Coming Soon website | Implemented | Public `/` route, contact and legal information only. |
| Product Studio | Private | Existing configurator is preserved behind the launch gate. |
| Authentication | Implemented | Supabase email/password and server-side sessions. |
| Pet profiles | Implemented | Account-scoped pets, photos, medical profiles, vaccinations and emergency contacts. |
| NFC tags | Foundation implemented | Private activation exists; a dedicated secret activation code is still required. |
| Lost Mode | Implemented privately | Owner-scoped, idempotent alert lifecycle; public finder flow remains gated. |
| Notifications | Foundation implemented | Preferences are stored privately; delivery providers are not connected. |
| Commerce | Not implemented | Requires a reviewed commercial schema and payment architecture. |
| RLS | Pending | App-layer ownership is enforced, but database policies must be applied before public data access. |

## Architecture

The application uses Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL through Drizzle ORM, and a Repository → Service → Server Action → UI boundary. UI does not query the database directly.

```text
app/        Routes, metadata and route-level loading/error states
components/ Shared visual components and product experiences
features/   Domain repositories, services, validation and Server Actions
lib/        Infrastructure, configuration, launch gate and shared utilities
db/         Existing Drizzle schema and migrations
docs/       Operational and architecture documentation
public/     Optimized public visual assets
tests/      Vitest unit tests
```

## Local development

```bash
npm install
npm run dev
```

Quality gates:

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and provide real values only outside Git. The public site needs `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL`. Private backend features additionally need the Supabase, database and medical-encryption variables documented in [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md).

## Launch gate

Production defaults to Coming Soon mode. `proxy.ts` allows only the public launch and legal routes while it is enabled. Set `PETTAP_COMING_SOON_MODE=false` only after a dedicated platform launch review; this is not a development toggle.

## Documentation

Start with [`docs/README.md`](./docs/README.md). The current stabilisation and known limitations are recorded in [`docs/STABILISATION.md`](./docs/STABILISATION.md).
