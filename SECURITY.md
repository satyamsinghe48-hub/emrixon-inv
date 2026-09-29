# Security Notes — P10 Final Candidate

## Tenant isolation

Every business-owned record must remain scoped by `business_id`, with Supabase RLS and server-side ownership checks.

## Privileged operations

Service-role Supabase access is server-only. It is used for worker/email operations that cannot rely on normal browser RLS permissions.

## Secrets

Never commit real values for:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET`
- billing webhook/provider secrets

## Webhook security

Billing webhook processing requires a valid signature and idempotent event identity. Paid checkout remains disabled until a verified provider adapter is connected.

## Worker security

The reminder worker requires `CRON_SECRET` and uses a timing-safe comparison. The worker also atomically claims jobs and respects the workspace automation toggle.

## Input safety

User-controlled invoice, client, email-template and URL values are validated server-side. User values rendered into email HTML are escaped by the P06 renderer.

## Release rule

Critical or high-severity unresolved security findings block the final production release.
