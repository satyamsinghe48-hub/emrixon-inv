-- EMRIXON Invoice Chaser P07: Automation + Failure Recovery
-- No demo/customer data is seeded.

alter table public.reminder_jobs
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by text,
  add column if not exists next_retry_at timestamptz,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists dead_lettered_at timestamptz;

create index if not exists reminder_jobs_due_processing_idx
  on public.reminder_jobs(status, scheduled_for, next_retry_at);

create index if not exists reminder_jobs_lock_idx
  on public.reminder_jobs(status, locked_at);

-- Atomically claim due/retryable work and recover stale processing leases.
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
  if p_worker_id is null or length(trim(p_worker_id)) = 0 then
    raise exception 'Worker id is required';
  end if;

  if p_limit < 1 or p_limit > 100 then
    raise exception 'Invalid worker batch size';
  end if;

  if p_lease_minutes < 1 or p_lease_minutes > 120 then
    raise exception 'Invalid processing lease';
  end if;

  update public.reminder_jobs
  set status = 'failed',
      locked_at = null,
      locked_by = null,
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
    where (
      rj.status = 'pending'
      and rj.scheduled_for <= p_now
    ) or (
      rj.status = 'failed'
      and rj.next_retry_at is not null
      and rj.next_retry_at <= p_now
    )
    order by rj.scheduled_for asc
    for update skip locked
    limit p_limit
  )
  update public.reminder_jobs rj
  set status = 'processing',
      locked_at = p_now,
      locked_by = p_worker_id,
      attempt_count = rj.attempt_count + 1,
      last_attempt_at = p_now,
      next_retry_at = null,
      updated_at = p_now
  from candidates
  where rj.id = candidates.id
  returning rj.id, rj.business_id, rj.invoice_id, rj.attempt_count;
end;
$$;

revoke all on function public.claim_due_reminder_jobs(text, integer, timestamptz, integer) from public;
grant execute on function public.claim_due_reminder_jobs(text, integer, timestamptz, integer) to service_role;

-- Worker transitions are server-only. Authenticated browser clients only retain P05 read access.
