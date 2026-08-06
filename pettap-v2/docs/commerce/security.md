# Commerce security

## RLS design

Migration `0003_commerce_and_operations_foundation` enables RLS on every commerce table.

- Customers can read and update only their own customer record.
- Customers can manage only addresses owned through their customer record.
- Customers can read only their own orders, order items, fulfilments and status history.
- Catalog, prices, inventory, shipping methods and payments receive no direct client grant in this foundation.
- Anonymous users receive no commerce-table access.

Ownership checks use `public.current_account_id()` and are scoped to `authenticated`. Server-only repositories use the database client and must remain behind protected server flows.

## PII

Addresses, customer identity and order snapshots contain personal information. They are not exposed to the public site, public pet profile or browser queries. Order snapshots are retained as commercial records and should only be deleted through a future retention policy.

## Operational controls

- No public checkout or payment endpoint is introduced.
- No Stripe or payment secret is added.
- No migration should be applied to an unknown or production environment without a reviewed deployment change.
- The migration uses restrictive foreign keys to preserve order history.
