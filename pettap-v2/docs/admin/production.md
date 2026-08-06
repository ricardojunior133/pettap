# Production queue

The production route is restricted by `production.read`; mutations require `production.update`. It reuses order and item snapshots rather than assuming the current product catalog still represents a purchased item.

`/admin/production` groups paid orders by item production state and fulfilment state: Waiting, Processing, Printed, and Ready to ship. Start and print actions update only `order_items.production_status` plus the operational order history. They never alter payment status.

`/admin/packing` shows completed-print orders not yet prepared for dispatch. Packing creates or advances the existing fulfilment record to `ready`, preserving the existing enum and avoiding a schema migration.

`/admin/orders/[orderId]/production-sheet` is an A4-friendly print view based on immutable item snapshots. It has no QR code, no PDF generation and no side effects.

No automated printing, stock reservation, or stock decrement is included.
