# Bootstrap an administrator

## Before running

Apply reviewed migrations to a confirmed non-production environment first. Do not grant access merely because an email address is known. The target user must already have a PetTap account created through normal sign-in.

## Command

```powershell
npm run admin:grant -- --account-id <account-uuid> --role super_admin --confirm "GRANT SUPER ADMIN"
```

The script can also resolve an email with `--email`, but account ID is preferred for operational clarity. It validates the role, verifies the corresponding Supabase Auth user and PetTap account, prints the target account ID, requires exact role-specific confirmation and refuses remote database targets unless `--allow-remote` is passed explicitly.

The first grant writes `admin.bootstrap.granted` with a null actor because no administrative actor exists yet. The script is not run automatically by migrations, builds, tests or deployments.

## Production procedure

1. Confirm the database environment and migration journal.
2. Use a privileged, audited terminal session.
3. Run the command with an account UUID and exact confirmation.
4. Record the operational approval outside the application.
5. Verify the new member through a fresh session in `/admin` after removing the Coming Soon route gate only when appropriate.
