# EMRIXON INVOICE CHASER — P08 BLUEPRINT LOCKED

Scope: Billing + Plans + Feature Entitlements.

Plans: Free $0/3 active invoices, Starter $9/25, Pro $19/100, Agency $39/500.

P08 adds centralized plan configuration, entitlement helpers, active-invoice usage display, business-level subscriptions, billing event idempotency foundation, provider abstraction, billing dashboard, pricing page, upgrade/cancel boundaries, and RLS.

Paid checkout is intentionally disabled until a verified live billing provider adapter is configured. No payment credentials are collected or stored by this checkpoint. Customer invoice payment URLs remain separate from SaaS subscription billing.

Downgrades never delete existing customer invoices. Existing data remains accessible; new creation is gated when usage exceeds the new plan limit.

P05/P06/P07 reminder, email, worker, retry and recovery systems remain intact.
