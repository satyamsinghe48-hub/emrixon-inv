# P09 Security + QA Report

## Static checks
- ZIP/source secret scan: required.
- Security headers: configured in `next.config.mjs`.
- Internal worker: requires `CRON_SECRET` (minimum 24 characters) and uses timing-safe comparison.
- Worker errors: generic external response; internal details are not returned.
- Billing webhook: signature presence/content-type/payload-size checks; live provider remains disabled intentionally.
- Browser client cannot mutate subscription rows through the existing grants/policies.
- Client/business mutations derive the active workspace server-side instead of trusting a submitted `business_id`.
- Invoice amount, date, currency, URL validation centralized.
- Effective billing plan is derived from subscription status/period, not stored plan string alone.
- P02→P05 reminder schema compatibility is reconciled by the P09 migration.
- Database invoice amount is hardened to `> 0`.

## Runtime checks still required before production
These require a real Supabase project, installed dependencies, and provider credentials:
- `npm install`
- `npm run lint`
- `npm run build`
- full migration run on a fresh Supabase database
- two-business RLS/IDOR tests
- real Resend send/delivery test
- real cron invocation with `CRON_SECRET`
- billing-provider webhook signature/idempotency tests after provider adapter is connected
- mobile device/browser regression test

P09 does not claim these environment-dependent runtime checks passed without those resources.
