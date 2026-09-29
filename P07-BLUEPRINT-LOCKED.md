# EMRIXON INVOICE CHASER — P07 BLUEPRINT LOCKED

Checkpoint: EMRIXON-INV-P07-LOCKED
Scope: Automation + Failure Recovery

P07 freezes the execution layer between P05 reminder scheduling and P06 transactional email. It adds atomic job claiming, processing leases, retry/backoff, dead-letter handling, paid/cancelled protection, protected cron execution, and operational reminder activity foundations.

Excluded: billing, WhatsApp, SMS, AI email generation, accounting, CRM, marketing email, native app, and unrelated features.

Definition of done:
- Due/retryable jobs can be atomically claimed.
- Concurrent workers cannot claim the same job.
- Stale processing leases are recoverable.
- Attempts, locks, retry timing, and terminal failure state are recorded.
- Paid/cancelled invoices are never emailed.
- Temporary failures retry with bounded backoff.
- Permanent/exhausted failures enter dead_letter.
- P06 email provider abstraction remains the only email sending boundary.
- Worker endpoint is protected by CRON_SECRET.
- Service-role operations remain server-only.
- P05 tenant isolation and schedule model remain intact.
- P08 billing remains a separate boundary.
