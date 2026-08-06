# PetTap Documentation

- [Event Demo Mode foundation](./event-demo-mode.md)

## Commerce foundation

The backend-only commerce foundation is documented in [commerce/architecture.md](./commerce/architecture.md), [commerce/data-model.md](./commerce/data-model.md), [commerce/order-lifecycle.md](./commerce/order-lifecycle.md), and [commerce/security.md](./commerce/security.md). It is not a public checkout and its migration must be reviewed before any production application.

The private guest commerce and Stripe foundation is documented in [commerce/guest-checkout.md](./commerce/guest-checkout.md). It is development-only until Stripe Test Mode validation is completed.

Development catalogue provisioning and Stripe Test Mode validation are documented in [commerce/stripe-test-mode.md](./commerce/stripe-test-mode.md). Live Mode is not enabled.

## Administrative foundation

The private RBAC foundation is documented in [admin/architecture.md](./admin/architecture.md), [admin/roles-and-permissions.md](./admin/roles-and-permissions.md), [admin/security.md](./admin/security.md), and [admin/bootstrap.md](./admin/bootstrap.md). It remains inaccessible while Coming Soon mode is enabled.

## Administrative support operations

Customer, pet and NFC administration is documented in [admin/customer-support.md](./admin/customer-support.md), [admin/pet-management.md](./admin/pet-management.md), [admin/nfc-management.md](./admin/nfc-management.md), and [admin/admin-data-privacy.md](./admin/admin-data-privacy.md). These capabilities remain migration-gated and private.

## Administrative commerce operations

The private order, production and fulfilment foundation is documented in [admin/orders.md](./admin/orders.md), [admin/production.md](./admin/production.md), and [admin/fulfilments.md](./admin/fulfilments.md). Migration 0006 remains pending application and is reviewed together with migration 0007 in [MIGRATIONS.md](./MIGRATIONS.md).

## Summary

This directory documents the PetTap codebase as it exists today. The public website is intentionally limited to the Coming Soon experience; private platform modules are not public product claims.

## Module status

| Module | Status | Notes |
| --- | --- | --- |
| Coming Soon | Implemented | Public homepage, Contact, Privacy, Terms, Shipping and Returns. |
| Authentication | Implemented | Supabase email/password, confirmation callback and cookie sessions. |
| Pets | Implemented | Account-scoped CRUD through repositories and services. |
| Photos | Implemented | Requires configured private Storage bucket and policies. |
| Medical | Implemented | Encrypted server-side payload; database RLS is pending. |
| Vaccinations | Implemented | Owner-scoped private CRUD. |
| Emergency contacts | Implemented | Owner-scoped private CRUD, up to five contacts. |
| NFC tags | Foundation implemented | Secure secret-code issuance remains pending. |
| Lost Mode | Implemented privately | Active/resolved state is idempotent; public rescue remains gated. |
| Notifications | Production email infrastructure implemented | Private, idempotent order-event history; development uses console output and production uses configured Resend delivery. DNS verification and controlled inbox validation remain required before activation. |
| Customer addresses | Implemented privately | Owner-scoped shipping and billing address book at `/dashboard/addresses`; no migration is required. |
| Customer profile | Implemented privately | Owner-scoped profile at `/dashboard/profile`; email is read-only and private preferences remain intentionally unsupported. |
| Pet public privacy | Implemented in development | Owner-scoped granular rescue sharing controls at `/dashboard/pets/[petId]/privacy`; defaults are private. |
| Customer orders | Implemented privately | Owner-scoped, read-only list and detail portal using immutable order snapshots. |
| Guest commerce and Stripe | Foundation implemented locally | Migration 0008 is pending review/application; Checkout Sessions and real payments remain disabled. |
| Admin roles | Not implemented | Requires roles and permissions. |
| Database RLS | Versioned, pending non-production verification | The account-isolation migration is ready but is not applied automatically to the configured Supabase project. |

## Index

- [Vision](./00-vision.md)
- [Brand](./01-brand.md)
- [Architecture](./04-architecture.md)
- [Authentication](./AUTH.md)
- [Backend](./BACKEND.md)
- [Environment](./ENVIRONMENT.md)
- [Lost Mode](./LOST_MODE.md)
- [Route access policy](./ROUTE_ACCESS_POLICY.md)
- [RLS policies](./security/rls.md)
- [Database access matrix](./security/access-matrix.md)
- [Private pet photo storage](./security/storage.md)
- [Stabilisation status](./STABILISATION.md)
- [Customer portal](./customer-portal.md)
- [Migration application guide](./MIGRATIONS.md)
- [Production readiness](./PRODUCTION_READINESS.md)

## Notes

- PetTap is NFC only. Do not add QR-code flows or imagery.
- Production routes are controlled by `proxy.ts`; do not infer public access from the presence of a local route.
- Future plans must be labelled as future work and must not be described as shipped features.
