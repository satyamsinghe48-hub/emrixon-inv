-- P10: Production candidate hardening and complete V1 reminder scheduling.
-- Additive/repair-oriented migration. No demo/customer data is seeded.

alter table public.businesses
  add column if not exists automation_enabled boolean not null default true;

-- Keep reminder rules self-contained and create the default five rules for each workspace.
create or replace function public.ensure_default_reminder_rules(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.reminder_rules (business_id, name, offset_days, offset_type, template_id, active)
  values
    (p_business_id, '3 days before', 3, 'before_due', 'invoice.due_soon', true),
    (p_business_id, 'Due today', 0, 'on_due', 'invoice.due_today', true),
    (p_business_id, '3 days overdue', 3, 'after_due', 'invoice.overdue_3', true),
    (p_business_id, '7 days overdue', 7, 'after_due', 'invoice.overdue_7', true),
    (p_business_id, '14 days overdue', 14, 'after_due', 'invoice.final_reminder', true)
  on conflict (business_id, name, offset_days) do nothing;
end;
$$;

revoke all on function public.ensure_default_reminder_rules(uuid) from public;
grant execute on function public.ensure_default_reminder_rules(uuid) to service_role;

-- Sync all eligible reminder jobs for one invoice. Times are persisted in UTC while
-- the 09:00 local business time is interpreted through the stored IANA timezone.
create or replace function public.sync_invoice_reminder_jobs(p_invoice_id uuid, p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_row public.invoices%rowtype;
  business_timezone text;
  automation_on boolean;
  rule_row public.reminder_rules%rowtype;
  target_at timestamptz;
  delta_days integer;
begin
  select i.* into invoice_row
  from public.invoices i
  where i.id = p_invoice_id and i.business_id = p_business_id;

  if not found then
    return;
  end if;

  select b.timezone, b.automation_enabled
  into business_timezone, automation_on
  from public.businesses b
  where b.id = p_business_id;

  if business_timezone is null then
    return;
  end if;

  perform public.ensure_default_reminder_rules(p_business_id);

  -- Never retain unsent work for non-active invoices or paused automation.
  if not automation_on or invoice_row.status not in ('scheduled','due','overdue') then
    update public.reminder_jobs
    set status = 'cancelled', locked_at = null, locked_by = null, next_retry_at = null,
        updated_at = timezone('utc', now())
    where business_id = p_business_id
      and invoice_id = p_invoice_id
      and status in ('pending','failed');
    return;
  end if;

  -- If the invoice date/rule configuration changes, pending/retryable jobs are rebuilt.
  update public.reminder_jobs
  set status = 'cancelled', locked_at = null, locked_by = null, next_retry_at = null,
      updated_at = timezone('utc', now())
  where business_id = p_business_id
    and invoice_id = p_invoice_id
    and status in ('pending','failed');

  for rule_row in
    select * from public.reminder_rules
    where business_id = p_business_id and active = true
    order by created_at asc
  loop
    delta_days := case
      when rule_row.offset_type = 'before_due' then -rule_row.offset_days
      when rule_row.offset_type = 'after_due' then rule_row.offset_days
      else 0
    end;

    target_at := ((invoice_row.due_date + delta_days) + time '09:00:00') at time zone business_timezone;

    if target_at > timezone('utc', now()) then
      insert into public.reminder_jobs (business_id, invoice_id, reminder_rule_id, scheduled_for, status)
      values (p_business_id, p_invoice_id, rule_row.id, target_at, 'pending')
      on conflict (invoice_id, reminder_rule_id, scheduled_for) do nothing;
    end if;
  end loop;
end;
$$;

revoke all on function public.sync_invoice_reminder_jobs(uuid, uuid) from public;
grant execute on function public.sync_invoice_reminder_jobs(uuid, uuid) to service_role;

create or replace function public.sync_business_reminder_schedules(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_id uuid;
begin
  if auth.uid() is not null and not public.can_manage_business(p_business_id) then
    raise exception 'Not authorized for this business';
  end if;
  perform public.ensure_default_reminder_rules(p_business_id);
  for invoice_id in
    select id from public.invoices
    where business_id = p_business_id
      and status in ('scheduled','due','overdue')
  loop
    perform public.sync_invoice_reminder_jobs(invoice_id, p_business_id);
  end loop;
end;
$$;

revoke all on function public.sync_business_reminder_schedules(uuid) from public;
grant execute on function public.sync_business_reminder_schedules(uuid) to service_role, authenticated;

-- New workspaces get defaults automatically in the same transaction as workspace creation.
create or replace function public.on_business_created_p10()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_default_reminder_rules(new.id);
  return new;
end;
$$;

revoke all on function public.on_business_created_p10() from public;

drop trigger if exists business_default_reminders_p10 on public.businesses;
create trigger business_default_reminders_p10
after insert on public.businesses
for each row execute function public.on_business_created_p10();

create or replace function public.on_business_reminder_settings_changed_p10()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.timezone is distinct from old.timezone
     or new.automation_enabled is distinct from old.automation_enabled then
    perform public.sync_business_reminder_schedules(new.id);
  end if;
  return new;
end;
$$;

revoke all on function public.on_business_reminder_settings_changed_p10() from public;
drop trigger if exists business_reminder_settings_sync_p10 on public.businesses;
create trigger business_reminder_settings_sync_p10
after update of timezone, automation_enabled on public.businesses
for each row execute function public.on_business_reminder_settings_changed_p10();

create or replace function public.on_invoice_reminder_schedule_changed_p10()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_invoice_reminder_jobs(new.id, new.business_id);
  return new;
end;
$$;

revoke all on function public.on_invoice_reminder_schedule_changed_p10() from public;
drop trigger if exists invoice_reminder_schedule_sync_p10 on public.invoices;
create trigger invoice_reminder_schedule_sync_p10
after insert or update of business_id, due_date, status on public.invoices
for each row execute function public.on_invoice_reminder_schedule_changed_p10();

-- Custom-rule edits are resynchronized explicitly by the authenticated server actions.
-- This avoids recursive triggers while keeping all schedule rebuild work server-side.
-- Existing workspaces (if any) receive defaults and schedules; fresh databases have none.
do $$
declare
  business_id uuid;
begin
  for business_id in select id from public.businesses loop
    perform public.ensure_default_reminder_rules(business_id);
    perform public.sync_business_reminder_schedules(business_id);
  end loop;
end $$;

-- Worker must respect the workspace automation toggle at claim time.
create or replace function public.claim_due_reminder_jobs(
  p_worker_id text,
  p_limit integer default 20,
  p_now timestamptz default timezone('utc', now()),
  p_lease_minutes integer default 15
)
returns table (
  id uuid,
  business_id uuid,
  invoice_id uuid,
  attempt_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_worker_id is null or length(trim(p_worker_id)) = 0 then raise exception 'Worker id is required'; end if;
  if p_limit < 1 or p_limit > 100 then raise exception 'Invalid worker batch size'; end if;
  if p_lease_minutes < 1 or p_lease_minutes > 120 then raise exception 'Invalid processing lease'; end if;

  update public.reminder_jobs
  set status = 'failed', locked_at = null, locked_by = null,
      next_retry_at = coalesce(next_retry_at, p_now),
      last_error = coalesce(last_error, 'Processing lease expired; job recovered.'),
      updated_at = p_now
  where status = 'processing'
    and locked_at is not null
    and locked_at < p_now - make_interval(mins => p_lease_minutes);

  return query
  with candidates as (
    select rj.id
    from public.reminder_jobs rj
    join public.businesses b on b.id = rj.business_id
    join public.invoices i on i.id = rj.invoice_id and i.business_id = rj.business_id
    where b.automation_enabled = true
      and i.status in ('scheduled','due','overdue')
      and (
        (rj.status = 'pending' and rj.scheduled_for <= p_now)
        or (rj.status = 'failed' and rj.next_retry_at is not null and rj.next_retry_at <= p_now)
      )
    order by rj.scheduled_for asc
    for update of rj skip locked
    limit p_limit
  )
  update public.reminder_jobs rj
  set status = 'processing', locked_at = p_now, locked_by = p_worker_id,
      attempt_count = rj.attempt_count + 1, last_attempt_at = p_now,
      next_retry_at = null, updated_at = p_now
  from candidates
  where rj.id = candidates.id
  returning rj.id, rj.business_id, rj.invoice_id, rj.attempt_count;
end;
$$;

revoke all on function public.claim_due_reminder_jobs(text, integer, timestamptz, integer) from public;
grant execute on function public.claim_due_reminder_jobs(text, integer, timestamptz, integer) to service_role;

comment on column public.businesses.automation_enabled is 'V1 automatic reminder processing switch. Worker must re-check before sending.';
comment on function public.sync_invoice_reminder_jobs(uuid, uuid) is 'Authoritative V1 reminder scheduler: stores UTC send times from business local timezone.';
