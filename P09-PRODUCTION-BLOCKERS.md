# P09 Production Blockers / Preconditions for P10

1. Configure a real Supabase project and run all migrations on a fresh database.
2. Configure server-only Supabase service-role, Resend, email sender and cron secrets in the deployment environment.
3. Connect a verified SaaS billing provider adapter before enabling paid checkout/webhooks.
4. Run production-environment lint/build and end-to-end smoke tests.
5. Perform two-user/two-business RLS and IDOR tests.
6. Verify email deliverability and cron worker behavior.

No fake payment success is enabled while the billing provider remains unconfigured.
