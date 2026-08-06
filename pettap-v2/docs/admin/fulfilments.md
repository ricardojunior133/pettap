# Admin fulfilments

Fulfilment creation, updates and dispatch are separately permissioned. Dispatch updates the fulfilment and related operational order state in one transaction, records status history, and writes an audit event.

Carrier APIs and customer notifications are intentionally excluded.

`/admin/shipping` is restricted by the existing admin permissions. It lists only fulfilments marked `ready`, accepts a validated manual tracking number and performs the `ready → shipped` transition transactionally. Label generation remains an explicitly labelled carrier-integration placeholder.
