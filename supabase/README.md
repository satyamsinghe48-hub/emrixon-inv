# Supabase — EMRIXON Invoice Chaser

This folder contains the complete database migration chain for the dedicated **Invoice Chaser** Supabase project.

## Migration order

Run every file in `supabase/migrations/` in filename order:

1. P02 database + RLS
2. P04 invoice integrity
3. P05 reminder engine
4. P06 email system
5. P07 status enum
6. P07 automation + failure recovery
7. P08 billing plans
8. P08 subscription trigger
9. P09 security + QA
10. P09 data integrity
11. P10 final release + complete reminder scheduling

## Important

Use a **new, dedicated Supabase project** for Invoice Chaser. Do not run these migrations against the existing EMRIXON STUDIO CMS project.

## P10 database behavior

P10 completes the V1 automation loop by adding:

- `businesses.automation_enabled`
- default five reminder rules for each workspace
- UTC reminder schedule generation using the business IANA timezone
- automatic schedule creation when an invoice is created/updated
- schedule refresh when reminder settings change
- automatic cancellation of unsent reminders for paid/cancelled invoices or paused automation
- worker claim filtering against the automation toggle

The database functions that perform privileged scheduling are server-side/definer functions. Browser users cannot directly mutate worker state.

## Production

Before launch, apply the full migration chain on a fresh database and run two-business RLS/IDOR tests. Do not treat a successful SQL migration as proof that external email, billing or cron services are configured.
