# EMRIXON Invoice Chaser — P03

## Scope
Business workspace onboarding/settings and client management.

## Supabase prerequisite
Apply P02 migration `supabase/migrations/0001_p02_database_and_rls.sql` to the NEW Invoice Chaser Supabase project before testing database-backed pages.

## What is implemented
- First business workspace setup
- Business settings edit
- Current-business lookup
- Client list
- Add client
- Edit client
- Archive client
- Tenant-scoped server queries/actions
- Mobile-first forms

## Intentionally not included
- Invoice creation
- Reminder scheduling
- Email sending
- SaaS billing
- Payment webhooks
- AI features

## Security notes
Browser input is not trusted for tenant access. Server actions authenticate the current user, and database RLS remains the final tenant-isolation layer. Never add the Supabase service-role key to browser environment variables.
