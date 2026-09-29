# EMRIXON Invoice Chaser — V1 Production Candidate

**Version:** 1.0.0-candidate  
**Checkpoint:** P10 — Production Candidate + Final Release Preparation

EMRIXON Invoice Chaser is a focused SaaS for automatically following up on unpaid invoices so service businesses spend less time manually chasing payments.

## Product flow

Signup → business setup → client → invoice → scheduled reminders → transactional email → retry/recovery → mark paid → future reminders stop.

Customer invoice payments remain external. The product stores an optional `payment_url`; it does not hold customer invoice money in V1.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Supabase Auth + PostgreSQL + RLS
- Resend transactional email provider abstraction
- Protected scheduled reminder worker

## Current V1 scope

- Authentication and protected dashboard
- Business/workspace setup
- Client management
- Invoice CRUD + lifecycle
- Reminder scheduling and automation
- Email templates, sending boundary and logs
- Worker locking, retry, recovery and dead-letter handling
- Free / Starter / Pro / Agency plan configuration
- Centralized feature entitlements and active-invoice limits
- Billing/subscription data model and provider boundary
- Basic Pro analytics
- Mobile-first settings and reminder controls
- Security hardening and QA tooling

## Production prerequisites

This ZIP is a **production candidate**, not proof that your external production services are already connected.

Before a real launch, configure a dedicated Supabase project, apply migrations in order, configure Resend sender credentials, configure `CRON_SECRET`, connect a verified SaaS billing provider adapter, and run real-device/browser smoke tests.

Never apply these migrations to the existing EMRIXON STUDIO CMS Supabase project.

## Setup

1. Install a supported Node.js release.
2. Copy `.env.example` to `.env.local`.
3. Add your project credentials.
4. Apply all SQL migrations in `supabase/migrations/` to the dedicated Invoice Chaser Supabase project.
5. Run `npm install`.
6. Run `npm run lint` and `npm run build`.
7. Run `npm run dev` for local testing.

## Environment

Public/browser configuration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only configuration:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `CRON_SECRET`

Never expose server-only values through `NEXT_PUBLIC_*` variables.

## Verification scripts

- `npm run qa:p09` — static P09 security checks
- `npm run qa:p10` — final-candidate release hygiene and integration checks

## Dependency lockfile note

The source checkpoint used for P10 did not contain a `package-lock.json`, and package metadata could not be downloaded in the build environment. P10 therefore does **not** fabricate a lockfile. Run `npm install` in an internet-connected development environment before the production build and commit the generated lockfile to your source repository.

## Architecture rules

- Brand/product identity is centralized.
- Plans and entitlements are centralized.
- Email providers are abstracted behind a server-only interface.
- Billing providers are abstracted and live checkout remains disabled until a verified adapter is connected.
- Tenant ownership is derived server-side; browser-supplied `business_id` values are not trusted.
- Service-role operations stay server-only.
- Reminder times are stored in UTC and calculated from the business IANA timezone.
- Customer data is never seeded into production migrations.

## Historical checkpoints

P01–P09 design/manifest files are retained in this candidate for traceability. Their files describe historical checkpoint scope; the active product behavior is represented by the P10 source tree and the current README.

## Final release name

**EMRIXON-INVOICE-CHASER-V1-FINAL-CANDIDATE**
