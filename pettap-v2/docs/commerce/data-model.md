# Commerce data model

## Catalog

| Table | Purpose | Integrity rule |
| --- | --- | --- |
| `products` | Sellable product family | Unique URL-safe slug; product is archived, not deleted. |
| `product_variants` | Base sellable configuration | Stable, unique SKU; no pet name or other personal data. |
| `product_prices` | Dated price records | Amount in integer minor units; only active rows are selectable. |
| `inventory_items` | Future stock foundation | On-hand, reserved and reorder values cannot be negative. |

## Customer and order records

| Table | Purpose | Integrity rule |
| --- | --- | --- |
| `customers` | Commerce identity for one account | `account_id` is required and unique while guest checkout is unavailable. |
| `customer_addresses` | Editable customer addresses | Private and owner-scoped. |
| `orders` | Commercial order record | Public order number is unique; address and customer snapshots are immutable history. |
| `order_items` | Purchased line snapshots | Product name, variant name, SKU, unit price, line total and personalisation are retained. |
| `payments` | Future provider record | No provider integration is active. |
| `fulfilments` | Production and shipment record | One order may support future fulfilment events without a separate shipment model yet. |
| `order_status_history` | Operational audit trail | Records explicit state transitions. |

## Known future relation

An order item will later be linked to a physical NFC tag during production. The relationship is deliberately deferred: the current tag activation model is preserved, and this sprint creates no physical tags or activation codes.

## Data retention

Customer addresses can eventually be removed from an account profile, but order address snapshots must remain for fulfilment, support and legally reviewed retention requirements. No deletion or anonymisation workflow is implemented in this sprint.
