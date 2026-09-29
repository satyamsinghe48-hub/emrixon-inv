# EMRIXON Invoice Chaser — P06

P06 adds Email System v1 on top of P05.

## Flow
Reminder Job → Email Service → Template Renderer → Provider → Client → Email Log

## Provider
Resend is the initial provider. All provider calls live behind `features/email/provider.ts` so another provider can be introduced later.

## Environment
Copy `.env.example` to `.env.local` and set:
- `RESEND_API_KEY`
- `EMAIL_FROM`
- optional `EMAIL_REPLY_TO`

Never use `NEXT_PUBLIC_` for email secrets.

## Database migration
Apply migrations in order, including `20260929010000_p06_email_system.sql`.

P06 creates `email_templates` and `email_logs`, adds business sender/reply-to settings, adds indexes/RLS, and installs system-level template catalog rows. No customer/demo records are created.

## Email variables
Only these variables are accepted:
`{{business_name}}`, `{{client_name}}`, `{{invoice_number}}`, `{{amount}}`, `{{currency}}`, `{{due_date}}`, `{{payment_url}}`, `{{business_email}}`.

Unknown variables are rejected. Email HTML is rendered without JavaScript.

## QA
1. Configure Resend and `EMAIL_FROM`.
2. Create a business/client/invoice/reminder job in Supabase.
3. Open Dashboard → Settings → Email.
4. Send a test email.
5. For an eligible reminder job, use Send now from Dashboard → Reminders.
6. Mark an invoice paid/cancelled and confirm no reminder email is sent.
7. Inspect Dashboard → Settings → Email → Activity.

P07 will add automated worker/retry/backoff/dead-letter recovery. P06 intentionally does not claim automated background processing.
