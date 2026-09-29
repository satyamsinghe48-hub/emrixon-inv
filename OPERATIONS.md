# Operations Runbook

## Routine checks

Review:

- failed reminder jobs
- dead-letter reminder jobs
- failed email logs
- past-due/failed subscriptions
- webhook failures
- worker health

## Pause automation

Open Dashboard → Settings → Reminder automation and pause automatic reminders. Pending/retryable reminder jobs are retained and will not be claimed while automation is off.

## Retry failures

Retryable reminder failures are processed by the protected worker using bounded backoff. Dead-letter jobs require operator review.

## Email troubleshooting

Check the email activity/logs page first. Provider message IDs and safe error messages are recorded. Never put provider keys or tokens into logs.

## Billing troubleshooting

Inspect the subscription and billing-event state. Do not manually trust or rewrite client-supplied plan values. Provider/webhook state is authoritative for real billing.

## Secret rotation

Rotate compromised server secrets immediately, redeploy, and invalidate the old value at the provider where applicable.

## Emergency control

The fastest safe automation control is the business-level automation toggle. Use it before changing code or disabling the whole application.
