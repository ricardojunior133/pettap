# Notifications and preferences

`notifications` currently contains only `account_id`, `channel`, `payload`, and `created_at`. The private centre therefore shows account-scoped recent notifications, ordered newest first. It deliberately does not claim to support unread state, marking as read, archiving, or deletion: no matching columns exist.

Communication preferences are stored under `settings.payload.notificationPreferences`. `settings.payload` is the schema-owned configuration field, so this avoids adding unsafe parallel storage. Development delivery uses the console provider only. In production, missing email configuration returns a controlled error and never reports a fake delivery.

## Transactional order history

Migration `0010_transactional_notification_history.sql` adds the private, server-only `transactional_notifications` ledger. It records the requested order event, recipient, rendered payload, provider, lifecycle status and a concise delivery error where applicable. A unique `(order_id, notification_type)` index is the final idempotency guard, including concurrent webhook or operations retries.

The central `TransactionalNotificationService` is invoked only after the order operation has committed. It supports guest and authenticated orders, records provider failures as `failed`, and never rolls back payment, production or fulfilment changes. Development uses `ConsoleNotificationProvider` only; it does not send email.

## Production email with Resend

Production resolves to `ResendNotificationProvider` when these server-only variables are configured:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=hello@pettap.co.uk
EMAIL_REPLY_TO=support@pettap.co.uk
EMAIL_SUPPORT=support@pettap.co.uk
```

Do not prefix these values with `NEXT_PUBLIC_` and do not commit them. If configuration is incomplete, the resolver fails closed: the existing transactional ledger records a `failed` delivery without rolling back payment or fulfilment.

The provider sends through Resend's HTTPS API and retries only transient `429`, `500`, and `503` responses twice, with 250 ms then 500 ms backoff. A permanent rejection or exhausted retry is saved as a concise delivery failure.

Templates have responsive inline-first HTML, an accessible plain-text equivalent, PetTap branding, a main action, Support, Privacy, Terms and site links. Shipment and delivery messages make `/track/{orderNumber}` the primary **Track your order** CTA and add the carrier tracking URL only when one is available.

### Deliverability and launch checklist

Before production delivery is enabled:

1. Verify `pettap.co.uk` in Resend.
2. Add and verify the Resend-provided SPF and DKIM DNS records.
3. Publish DMARC initially with monitoring (`p=none`) and increase enforcement only after alignment is confirmed.
4. Send each template only to controlled Gmail, Outlook and Apple Mail inboxes.
5. Verify mobile and dark-mode rendering, all links, Reply-To, spam placement, and SPF/DKIM/DMARC alignment.

No real send is attempted until a controlled test recipient and verified Resend configuration are intentionally supplied.

The current hooks cover `payment_received`, `production_started`, `printed`, `packed`, `shipped`, `delivered`, and `order_cancelled`. The history is available through the server-only repository for administrative use; exposing a read-only admin history panel can be added without changing its persistence model.

Future schema work: add `notifications.read_at` and, if notification lifecycle management is required, `archived_at` or a deletion policy.
