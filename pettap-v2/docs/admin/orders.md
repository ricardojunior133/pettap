# Admin orders

## Summary

Administrative order management is server-authorized through `orders.read` and `orders.update_status`. The customer portal never receives internal notes or administrative audit metadata.

## Lifecycle

The implementation reuses the existing commerce enum: `draft → pending_payment → paid → in_production → ready_to_ship → shipped → completed`. Eligible states may be cancelled or refunded only where the existing domain transition service permits it.

## Safety

Status changes are validated server-side, recorded in `order_status_history`, and audited. Payment status and pricing remain out of scope.
