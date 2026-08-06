# Order lifecycle

## Current capability

This sprint defines the lifecycle and validates transitions in code. It does not create orders, capture payments, reserve inventory or ship products.

```text
draft → pending_payment → paid → in_production → ready_to_ship → shipped → completed
```

Cancellation is permitted before shipment. Refund is available after payment where an operational flow later authorizes it. Each persisted transition should create an `order_status_history` record in the same database transaction.

## Future implementation requirements

1. Validate the client request with the shared Zod schemas.
2. Resolve active catalog prices on the server.
3. Create order, items and history together in one transaction.
4. Integrate payment provider webhooks before marking an order paid.
5. Add transactional inventory reservation before accepting paid orders.
6. Record fulfilment and tracking updates only from protected operations tooling.
