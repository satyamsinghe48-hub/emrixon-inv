-- EMRIXON Invoice Chaser P04
-- Invoice integrity hardening. Apply after 0001_p02_database_and_rls.sql.

create or replace function public.ensure_invoice_client_business_match()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.clients c
    where c.id = new.client_id
      and c.business_id = new.business_id
  ) then
    raise exception 'Invoice client must belong to the same business';
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_client_business_guard on public.invoices;
create trigger invoices_client_business_guard
before insert or update of business_id, client_id on public.invoices
for each row execute function public.ensure_invoice_client_business_match();

create or replace function public.enforce_invoice_status_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.status = 'paid' then
    new.paid_at = coalesce(new.paid_at, timezone('utc', now()));
    new.cancelled_at = null;
  elsif new.status = 'cancelled' then
    new.cancelled_at = coalesce(new.cancelled_at, timezone('utc', now()));
    new.paid_at = null;
  else
    new.paid_at = null;
    new.cancelled_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_status_timestamp_guard on public.invoices;
create trigger invoices_status_timestamp_guard
before insert or update of status, paid_at, cancelled_at on public.invoices
for each row execute function public.enforce_invoice_status_timestamps();

comment on function public.ensure_invoice_client_business_match() is 'P04 tenant integrity guard: invoice client and invoice business must match.';
comment on function public.enforce_invoice_status_timestamps() is 'P04 invoice lifecycle consistency for paid/cancelled timestamps.';
comment on table public.invoices is 'P04 invoice management. Payment collection remains external; reminder automation starts in P05/P06.';
