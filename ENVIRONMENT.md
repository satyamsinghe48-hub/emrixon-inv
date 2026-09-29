# Environment Variables

| Variable | Client visible | Required for local core | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Yes | Supabase browser/auth key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes for worker/email | Privileged server-side Supabase operations |
| `RESEND_API_KEY` | No | Yes for real email | Resend server API key |
| `EMAIL_FROM` | No | Yes for real email | Default transactional sender |
| `EMAIL_REPLY_TO` | No | Optional | Default reply-to address |
| `CRON_SECRET` | No | Yes for worker | Protected worker authentication |

Never prefix private credentials with `NEXT_PUBLIC_`.

Billing provider variables are intentionally not listed as active production requirements because the V1 provider adapter is not enabled by default.
