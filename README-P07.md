# P07 — Automation + Failure Recovery

P07 extends the verified P06 checkpoint with a protected automation worker.

## Runtime flow
Reminder Job → atomic claim → processing lease → invoice re-check → P06 Email Service → result logging → sent / retry / cancelled / dead_letter.

## Worker
`GET/POST /api/internal/reminders/worker` is protected by `Authorization: Bearer $CRON_SECRET` and is scheduled every 5 minutes through `vercel.json`.

## Recovery
- max attempts: 4
- retry delays: 5, 15, 60 minutes
- processing lease: 15 minutes
- stale processing jobs are recovered by the database claim function
- terminal failures enter `dead_letter`

## Security
The worker uses the server-only Supabase service-role client. The service-role key and Resend key must never be prefixed with `NEXT_PUBLIC_`, committed, or exposed to browser code.

## Deployment prerequisites
Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, and a strong `CRON_SECRET` in the deployment environment. Apply migrations in order through P07.

Actual production sending requires valid Supabase/Resend configuration and a deployed cron-capable environment.
