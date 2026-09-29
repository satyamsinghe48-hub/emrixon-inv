# Deployment

## Pre-deployment gates

- Fresh Supabase migration run completed
- RLS/IDOR two-business test completed
- Resend sender configured and tested
- Cron secret configured
- Production environment variables configured
- `npm run lint` passes
- `npm run build` passes
- Mobile smoke test completed
- Billing provider verified before enabling paid checkout

## Vercel

The project includes `vercel.json` with a five-minute cron for:

`/api/internal/reminders/worker`

Configure the production environment variables in Vercel. The worker endpoint must remain protected by `CRON_SECRET`.

## Important billing rule

Do not treat a browser-side “payment success” message as authoritative. Subscription state must come from the verified provider/webhook boundary.

## Rollback

For application rollback, use the deployment platform's previous deployment. For database changes, prefer additive migrations and verify the migration sequence on a fresh database before applying to production.
