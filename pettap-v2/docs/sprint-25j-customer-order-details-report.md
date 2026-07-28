# Sprint 25J — Customer Order Details Report

## Result

`/account/orders/[orderNumber]` now reads a real order through the reconciled Commerce foundation, only for the authenticated account. The implementation is read-only.

## Answers

1. **Can a customer open their own order?** Yes, when its `account_id` matches the authenticated account.
2. **Can a customer open another account's order?** No. The owner-scoped repository returns no result.
3. **Can a changed URL bypass ownership?** No. The same account-and-order-number predicate is used for every detail lookup.
4. **Were internal IDs exposed?** No.
5. **Were Stripe data exposed?** No.
6. **Was internal metadata exposed?** No.
7. **Is personalisation allowlisted?** Yes; unknown keys are removed in the service.
8. **Are financial totals consistent?** Yes. Local tests verify the integer minor-unit equation; persisted values are not recalculated or changed.
9. **Is tracking shown only when it exists?** Yes. No placeholder or broken tracking link is rendered.
10. **Was Checkout changed?** No.
11. **Was Stripe changed?** No.
12. **Was the schema changed?** No.
13. **Was a migration created or executed?** No.
14. **Does the portal have real order list and detail reads?** Yes. Both use the same owner-scoped repository and service foundation.
15. **Recommended next step?** Sprint 25K can add a customer-safe order timeline using the same owner-verified detail record.

## Validation

Automated tests use local fakes only. No remote order, account, payment, or customer data was read or changed. Quality-gate results are recorded after the final implementation pass.
