# P06 Security Notes

- Resend API key is server-only.
- `EMAIL_FROM` and `EMAIL_REPLY_TO` are server environment settings.
- Email templates and logs are tenant isolated with Supabase RLS.
- System templates are read-only to business members because their `business_id` is null.
- Business custom templates require a business membership.
- Reminder sends re-check invoice status immediately before sending.
- Paid/cancelled invoices are cancelled at the reminder-job boundary and are not emailed.
- Client email is validated before provider call.
- Template variables are allow-listed and HTML escaped.
- No JavaScript is accepted as a template feature.
- P06 does not expose provider secrets to the browser.
- P07 must add stronger distributed locking, retry/backoff, webhook signature verification, and rate limiting before unattended production automation.
- The Supabase service-role key is used only by server-side send/logging code and must never be shipped to the browser or committed to Git.
