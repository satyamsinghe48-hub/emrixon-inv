# P08 — Billing + Plans

Checkpoint: EMRIXON-INV-P08-LOCKED

## Included
- Free / Starter / Pro / Agency plan configuration
- Central entitlement engine
- Active invoice limit model
- Business-level subscriptions
- Billing events with provider event idempotency
- Usage event foundation
- Billing provider abstraction
- Billing dashboard
- Public pricing page
- Upgrade/cancellation boundaries
- Tenant RLS

## Provider safety
P08 does not enable live paid checkout. A verified billing-provider adapter must be implemented before taking subscription payments. Do not add provider secrets to client code, GitHub, or ZIP checkpoints.

## Payment separation
Customer invoice payment URLs remain separate from EMRIXON SaaS subscription billing.

## Build verification
Dependency installation/live Next build may require network access and project credentials; this checkpoint is structurally and statically checked before release.
