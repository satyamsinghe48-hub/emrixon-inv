-- P09 data-integrity hardening. Safe additive constraints only.
alter table public.invoices
  drop constraint if exists invoices_amount_positive;

alter table public.invoices
  add constraint invoices_amount_positive check (amount > 0);
