# Sprint 25A — Premium Customer Portal Audit

## 1. Executive summary

This audit was performed from the confirmed production commit
`a4adc59b86e095993d6c584ad5a43f9b21c9ee4b` in the isolated worktree
`C:\Users\ricar\premium-account-portal\pettap-v2`, branch
`feature/premium-account-portal`.

The production baseline is healthy for the intentionally released scope: premium
Coming Soon, Event Demo activation and public Event Demo profiles. Its customer
portal does **not** exist in this commit. There are no `/account` or `/dashboard`
routes, no customer-facing portal components, and no customer domain services or
repositories in the tracked production project.

The original workspace contains a large, uncommitted customer-platform foundation,
but it is not part of the production baseline and was inspected read-only only. It
must not be treated as deployed, production-ready, or safely reusable until it is
separately reviewed, dependency-scoped, and versioned.

**Sprint 25B must begin with an explicit decision on the source of truth for the
portal foundation.** Building a visual portal now would either be unauthenticated
or use mock data, both of which are outside this sprint's constraints.

## 2. Current production portal structure

### Routes in the production baseline

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Present | Premium Coming Soon page. Outside Sprint 25 scope. |
| `/login` | Present | Existing authentication entry page. |
| `/event/activate/[publicCode]` | Present | Public Event Demo activation. Prohibited area. |
| `/event/profile/[sessionPublicId]` | Present | Public Event Demo profile. Prohibited area. |
| `/admin/event-demo` | Present | Protected Event Demo administration. Prohibited area. |
| `/account` | Absent | No layout, page, loading state, error boundary, or redirect. |
| `/dashboard` | Absent | No layout, page, loading state, error boundary, or redirect. |

The production build confirms only `/`, `/login`, Event Demo pages and Event Demo
admin/export routes. No customer portal route can be redesigned safely in this
baseline.

### Auth and route protection

The baseline has the authentication entry page and the Event Demo admin protection
required by the released product. It does not contain a customer account layout or
customer route guard to audit. Introducing either would be a functional/auth change,
which is prohibited in Sprint 25A.

## 3. Read-only inventory of the uncommitted local portal foundation

The following inventory exists only in `C:\Users\ricar\pettap\pettap-v2` and is
not included in commit `a4adc59`. It is evidence of possible future reuse, not an
implementation target for this audit.

### Account routes

| Route | Page | Observed responsibility | Status |
| --- | --- | --- | --- |
| `/account` | `app/account/page.tsx` | Counts pets, tags, orders and active products; recent orders. | Partial; lacks production baseline. |
| `/account/pets` | `app/account/pets/page.tsx` | Customer pet list. | Local-only. |
| `/account/tags` | `app/account/tags/page.tsx` | Customer tag list. | Local-only. |
| `/account/orders` | `app/account/orders/page.tsx` | Customer order list. | Local-only. |
| `/account/orders/[orderId]` | `app/account/orders/[orderId]/page.tsx` | Order detail. | Local-only. |
| `/account/addresses` | `app/account/addresses/page.tsx` | Addresses. | Local-only. |
| `/account/settings` | `app/account/settings/page.tsx` | Account settings. | Local-only. |
| `/account/security` | `app/account/security/page.tsx` | Security placeholder/entry. | Local-only. |
| `/account` shell | `app/account/layout.tsx`, `loading.tsx` | Redirects unauthenticated users and renders `AccountShell`. | Local-only. |

The local account overview calls `PetService`, `TagService`,
`CustomerOrderService`, and `getCurrentUser`. This is the right server-side
direction, but it is absent from the production commit.

### Legacy dashboard routes

The local workspace additionally contains legacy `/dashboard` namespaces for
overview, profile, pets, pet detail/edit/setup, medical, contacts, vaccinations,
privacy, Lost Mode, tags, activation, addresses, notifications, settings and orders.
This duplicates the `/account` information architecture and creates a migration
risk: no canonical namespace has been committed. Sprint 25B must retain one
canonical customer namespace and add safe redirects only after review.

### Dynamic routes, loading and errors

Local-only dynamic customer routes include pet IDs, contact IDs, vaccination IDs,
tag IDs and order IDs. Loading states exist for selected dashboard and pet/order
pages, and `app/dashboard/error.tsx` exists; equivalent `/account` error and
not-found coverage is not evidenced. The production baseline contains none of these
routes, so their runtime behavior cannot be claimed as released.

## 4. Component map

### Reusable local-only candidates

| Component | Responsibility | Assessment |
| --- | --- | --- |
| `components/account/AccountShell.tsx` | Authenticated shell/navigation. | Potential reuse after auth dependencies are versioned. |
| `components/dashboard/CustomerAddresses.tsx` | Address interaction UI. | Local-only; requires ownership/action review. |
| `components/dashboard/CustomerProfile.tsx` | Profile editing UI. | Local-only; requires action contract review. |
| `components/dashboard/PetCard.tsx` | Pet summary card. | Potential presentation primitive. |
| `components/dashboard/QuickActions.tsx` | Contextual navigation/actions. | Candidate, but must be driven by real capabilities. |
| `components/dashboard/RecentActivity.tsx` | Activity display. | Candidate only when a safe activity DTO exists. |
| `components/dashboard/workspace/*` | Pet workspace views. | High regression risk: appears coupled to legacy dashboard mock/import paths. |

### Design system candidates

The local workspace contains Button, Card, Badge, Input, EmptyState and Skeleton
variants. The production baseline's own UI surface is intentionally smaller.
Before reuse, Sprint 25B should identify the actual APIs shared by the production
project rather than importing the broad uncommitted design-system tree.

### UX and accessibility findings

No released portal UI is available to visually assess. In the local-only routes,
the principal risks are duplicated navigation (`/account` and `/dashboard`), uneven
loading/error coverage, potential mobile table/card divergence, and components that
appear to carry business-state assumptions. The redesign should use landmarks,
visible focus, labelled controls, semantic headings, skeletons rather than blank
spinners, reduced motion, and server-rendered signed URLs.

## 5. Server Actions map (local-only, not production)

| Domain | Actions observed | Security/revalidation notes |
| --- | --- | --- |
| Profile | `updateCustomerProfile` | Uses a dedicated customer-profile action state. |
| Pets | `createPetAction`, `updatePetAction`, `deletePetAction` | Must retain server-side ownership through `PetService`. |
| Privacy | `updatePetPublicPreferences` | Must remain server-side and never expose consent defaults publicly. |
| Medical | `createMedicalAction`, `updateMedicalAction` | Medical data remains authenticated/private. |
| Emergency contacts | create, update, delete actions | Requires ownership and public-consent separation. |
| Photos | upload, set-primary, delete actions | Signed URLs must be generated server-side. |
| Tags | `activateTagAction` | Customer-safe activation only; never expose codes/hashes. |
| Lost Mode | create/resolve lost-report actions | Preserve idempotency and audit behavior. |
| Addresses | create, update, set-default, delete actions | Local source is compressed and needs readability/contract review. |
| Notifications | `updateNotificationPreferencesAction` | Preferences only; read-state support is not confirmed. |

No customer order server action was found in this inventory; orders appear read-only,
which is appropriate for a portal redesign.

## 6. Services and repository map (local-only, not production)

| Domain | Service | Repository | Existing capability / gap |
| --- | --- | --- | --- |
| Pets | `PetService` | `PetRepository`, public preferences repository | Account-scoped list/get/write pattern; archive support not confirmed from this audit. |
| Tags | `TagService` | `TagRepository` | List/get/activate with authenticated-account and pet authorization checks. |
| Lost Mode | `LostReportService` | `LostReportRepository` | Create/resolve flow; activity feed DTO not confirmed. |
| Medical | `MedicalService` | `MedicalRepository` | Encrypted medical payload service; portal must keep it private. |
| Emergency contacts | `EmergencyContactService` | `EmergencyContactRepository` | CRUD and limit/error types. |
| Photos | `PhotoService`, `SupabaseStorageService` | `PhotoRepository` | File validation, private paths and storage integration. |
| Notifications | `NotificationService` | `NotificationRepository` | List, preferences and create-for-account; read/unread mutation not confirmed. |
| Orders | `CustomerOrderService`, order read/tracking services | customer/order repositories | Customer list and detail candidates; guest-account linkage needs explicit review. |
| Addresses | `CustomerAddressService` | `CustomerAddressRepository` | Customer-scoped address CRUD/default handling. |

The expected `Repository → Service → Server Action` pattern is visible in the
local-only foundation. It cannot be certified for production because none of those
files are tracked in the production baseline. No direct component-to-Supabase access
was identified in the small sampled account overview; a complete certification must
follow a scoped import/versioning decision.

## 7. Functional matrix

| Area | Production baseline | Local-only foundation | Readiness for premium redesign |
| --- | --- | --- | --- |
| Overview | Absent | Partial counts/recent orders. | Blocked pending versioning. |
| My Pets | Absent | List/create/edit/detail routes and services. | Candidate after ownership test review. |
| Medical | Absent | Services/actions/routes present. | Candidate; private-data review required. |
| Emergency contacts | Absent | CRUD foundation present. | Candidate; public-consent review required. |
| Photos | Absent | Upload/primary/delete and storage services present. | Candidate; signed-URL contract review required. |
| NFC tags | Absent | List/get/activate foundations present. | Candidate; status/history UI gaps remain. |
| Lost Mode | Absent | Create/resolve foundation present. | Candidate; visual/activity state needs confirmation. |
| Activity | Absent | Legacy components exist; safe source DTO unconfirmed. | Empty state only until confirmed. |
| Orders | Absent | List/detail services/routes present. | Candidate; order privacy and guest linkage review required. |
| Notifications | Absent | List/preferences service present. | Candidate; read-state/pagination unconfirmed. |

## 8. Key gaps and risks

1. **Critical baseline mismatch:** the production commit has no customer portal
   backend or UI. Importing local-only files would be a new platform release, not a
   visual-only redesign.
2. **Duplicate namespaces:** `/account` and `/dashboard` coexist locally without a
   committed canonical-route policy.
3. **Unversioned dependencies:** local portal files depend on uncommitted auth,
   database, schema, UI and package changes.
4. **Forbidden-area coupling:** orders and addresses depend on Commerce; tags and
   public preferences depend on database/schema; photo flows depend on Storage.
5. **Unknown activity DTO:** no confirmed account-safe activity timeline source is
   available in production.
6. **Potential regression:** moving portal UI before its dependencies are versioned
   can break Event Demo/Coming Soon or leak private data.

## 9. Proposed visual architecture for Sprint 25B

Once a versioned customer foundation exists, use a server-rendered `AccountShell`
with a compact mobile navigation, page header, reusable stat card, pet card, status
badge, empty state, and read-only timeline. Pages should receive small safe view
models from services, not database entities. Client components should be restricted
to existing form/actions and small motion/interaction surfaces.

Recommended implementation order:

1. Version and validate the authentication/customer service foundation separately.
2. Choose `/account` as the canonical namespace and document redirect policy.
3. Build the shared shell and overview from safe account-scoped read models.
4. Redesign pets list/detail and signed-photo presentation.
5. Redesign medical, contacts, tags and Lost Mode without changing actions.
6. Redesign orders and notifications after privacy/DTO review.
7. Add ownership, DTO-leakage, empty-state and responsive/accessibility tests.

## 10. Likely Sprint 25B files (not modified in Sprint 25A)

Subject to explicit approval to import/version the customer foundation, likely
presentation files are:

- `app/account/layout.tsx`, `app/account/page.tsx`, `app/account/pets/page.tsx`
- `app/account/pets/[petId]/page.tsx` (currently absent locally and would require
  a canonical-route decision)
- `app/account/orders/page.tsx`, `app/account/orders/[orderId]/page.tsx`
- `app/account/notifications/page.tsx` (only if a backed route is introduced)
- `components/account/AccountShell.tsx` plus narrowly scoped account UI components
- portal-specific tests and a new account documentation page.

Files that must remain untouched without separate authorization include Event Demo,
Coming Soon, `app/event/**`, `app/admin/event-demo/**`, Stripe/checkout/webhooks,
catalogue/Studio, commerce contracts, schemas, migrations, RLS, Storage, DNS and
remote environment configuration.

## 11. Quality gates

Executed in the actual nested production project
`C:\Users\ricar\premium-account-portal\pettap-v2\pettap-v2`:

| Command | Result | Notes |
| --- | --- | --- |
| `npm install` | Pass | 12 high-severity dependency audit findings reported by npm; no remediation performed. |
| `npm run lint` | Pass | No lint output/errors. |
| `npm run test` | Pass | 6 files, 34 tests. |
| `npm run typecheck` | Pass | No TypeScript errors. |
| `npm run build` | Pass | Next.js 16.2.10 production build completed. |

An initial quality-gate attempt at the outer repository wrapper is intentionally
not representative: that wrapper is not the published application root and its
package lacks test/typecheck scripts. Its failure is a repository-layout finding,
not a production application failure.

## 12. Acceptance criteria for Sprint 25B

- A versioned customer portal foundation exists in the target branch.
- Every portal route has server-side authentication and owner-scoped services.
- One customer route namespace is canonical; old routes redirect safely or are
  explicitly retired.
- UI uses safe view models, server-generated signed URLs, accessible loading/error/
  empty states and responsive navigation.
- No Event Demo, Coming Soon, Stripe, checkout, schema, migration, RLS, Storage or
  remote-environment contract changes are introduced.
- Lint, tests, typecheck and build pass in the actual nested application root.

## 13. Sprint 25A conclusion

No functional file was changed during Sprint 25A. This report was retained as
audit evidence and is versioned with the controlled Sprint 25B documentation. No
push, deploy, database, migration, RLS, Storage or remote configuration operation
was performed.
