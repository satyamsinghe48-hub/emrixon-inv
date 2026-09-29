# EMRIXON Invoice Chaser — P04 Blueprint (LOCKED)

This checkpoint implements the frozen P04 Invoice Management System specification approved on 2026-09-28.

## Included
- Invoice create/edit/detail/list workflows
- Invoice number uniqueness per business
- Client/business integrity
- Draft/scheduled/due/overdue/paid/cancelled status model
- Manual mark paid/unpaid/cancelled actions
- Payment URL storage/display only
- Server-side validation and tenant scoping
- Supabase RLS plus database integrity trigger
- Real dashboard invoice metrics
- Mobile-first responsive UI
- Future P05 reminder-engine extension points

## Explicitly excluded
- Email reminders / Resend
- WhatsApp/SMS
- Stripe/PayPal webhooks
- Automatic overdue scheduler
- AI message generation
- Accounting integrations
- GST/VAT automation
- Recurring invoices
- PDF invoice generation

## Definition of done
A real authenticated business can select one of its clients, create a valid invoice, securely store it in Supabase, view/edit it, manually mark it paid/unpaid or cancelled, see it in the dashboard/list, and no other tenant can access or manipulate it.
