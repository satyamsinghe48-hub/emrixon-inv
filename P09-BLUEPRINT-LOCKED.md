# EMRIXON INVOICE CHASER — P09 BLUEPRINT LOCKED

Scope: Security + Full QA.

P09 is a hardening/verification checkpoint for P01–P08. It does not add unrelated product features.

Coverage:
- authentication/session security
- tenant isolation and RLS review
- IDOR/direct URL checks
- server-only privileged operations
- secret/environment audit
- input validation and money/date/URL validation
- invoice lifecycle and plan-limit regression
- reminder worker concurrency/retry/dead-letter/stuck-job recovery
- email template/provider/error-path QA
- billing plan/subscription/webhook security review
- XSS and unsafe URL review
- security headers
- mobile/loading/empty/error state review
- accessibility/SEO/performance review
- migration/data-integrity review
- production environment/readiness checklist

Intentional pre-production boundary:
- No live billing provider is enabled in P09. Paid checkout/webhook acceptance remains disabled until a verified provider adapter is connected.
- Real Supabase/Resend credentials are never committed to source or ZIP.
