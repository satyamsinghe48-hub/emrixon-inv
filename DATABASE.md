# Database Notes

## Tenant model

`businesses` is the workspace root. Client, invoice, reminder, email, usage and subscription records attach to the workspace through `business_id`.

## Invoice lifecycle

`draft` → `scheduled` → `due` → `overdue` → `paid`

or:

`draft` → `cancelled`

P10 ensures unsent reminder jobs are cancelled for paid/cancelled invoices.

## Reminder scheduling

P10 uses the business IANA timezone and schedules at 09:00 local time. Stored timestamps are UTC.

Default rules:

- 3 days before due
- due today
- 3 days overdue
- 7 days overdue
- 14 days overdue

A unique `(invoice_id, reminder_rule_id, scheduled_for)` index protects logical duplicate schedules.

## Billing

Subscriptions are business-level. Customer invoice payments remain external through the stored payment URL.
