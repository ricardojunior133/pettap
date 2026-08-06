# Administrative security

## Defense in depth

1. Coming Soon proxy blocks `/admin` publicly while the launch gate is active.
2. `app/admin/layout.tsx` resolves `admin.dashboard.read` on the server before rendering a shell.
3. `app/admin/page.tsx` repeats the check at the page boundary.
4. Future actions and services must call `requireAdminPermission` themselves.

Missing, disabled or insufficient memberships fail closed. An authenticated user remains a normal customer when their membership is disabled; only `/admin` access is denied.

## Membership safety

- Users cannot grant, change or disable their own membership through `AdminMembershipService`.
- Only `admins.manage` can perform membership operations.
- A database advisory transaction lock and active-super-admin count prevent removal or demotion of the last active super administrator.
- No role is inferred from email, user metadata or an environment variable.

## Auditing

The foundation records bootstrap grants, membership grants, role changes, disables and meaningful denied access. Membership changes and their audit record are committed in the same database transaction; a failed audit insert rolls back the change. Metadata is intentionally minimal and must never contain secrets, passwords, activation codes, payment data, full addresses or medical records.
