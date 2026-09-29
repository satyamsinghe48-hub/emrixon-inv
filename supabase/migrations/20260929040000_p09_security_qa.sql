-- EMRIXON Invoice Chaser P09: Security + QA hardening.
-- Additive migration only. No demo/customer data is seeded.

-- P02 created reminder_rules before P05 introduced its scheduler fields.
-- Reconcile the live schema instead of relying on CREATE TABLE IF NOT EXISTS.
alter table public.reminder_rules
  add column if not exists offset_type public.reminder_offset_type,
  add column if not exists template_id text,
  add column if not exists stop_when_paid boolean not null default true;

-- Existing P02 rows (if any) used only a non-negative offset_days field.
-- Convert them to the P05/P06 representation before enforcing the range.
update public.reminder_rules
set offset_type = case
  when offset_days = 0 then 'on_due'::public.reminder_offset_type
  else 'after_due'::public.reminder_offset_type
end
where offset_type is null;

update public.reminder_rules
set template_id = case trim(coalesce(template_id, ''))
  when '' then case trim(coalesce(template_key, ''))
    when 'friendly_reminder' then 'invoice.due_soon'
    when 'due_soon' then 'invoice.due_soon'
    when 'due_today' then 'invoice.due_today'
    when 'overdue_3' then 'invoice.overdue_3'
    when 'overdue_7' then 'invoice.overdue_7'
    when 'final_reminder' then 'invoice.final_reminder'
    else null
  end
  else template_id
end
where template_id is null or length(trim(template_id)) = 0;

alter table public.reminder_rules
  alter column offset_type set not null;

drop constraint if exists reminder_rules_offset_nonnegative;
drop constraint if exists reminder_rules_offset_type_check;

alter table public.reminder_rules
  add constraint reminder_rules_offset_range_check check (offset_days between 0 and 365),
  add constraint reminder_rules_template_id_check check (template_id is null or char_length(trim(template_id)) between 1 and 100);

create index if not exists reminder_rules_business_active_idx
  on public.reminder_rules(business_id, active);

-- Subscription entitlement is application-enforced. Keep browser writes disabled;
-- service-role/provider operations are the only supported mutation path.
drop policy if exists subscriptions_admin_update on public.subscriptions;

-- Security comments document privileged columns and worker-only fields.
comment on column public.subscriptions.provider_subscription_id is 'Provider identifier; server-side billing provider only.';
comment on column public.reminder_jobs.locked_by is 'Worker identity; never trusted from browser input.';
comment on column public.reminder_jobs.last_error is 'Safe operational error only; do not store provider secrets or tokens.';
