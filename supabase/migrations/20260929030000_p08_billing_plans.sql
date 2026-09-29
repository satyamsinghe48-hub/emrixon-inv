-- P08: billing/subscription foundation. No live provider credentials or customer payment data are stored here.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','starter','pro','agency')),
  status text not null default 'active' check (status in ('active','trialing','past_due','cancelled','expired','incomplete','paused')),
  provider text not null default 'none',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id),
  unique (provider, provider_subscription_id)
);
create index if not exists subscriptions_business_idx on public.subscriptions(business_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  error_message text,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique(provider, provider_event_id)
);
create index if not exists billing_events_business_idx on public.billing_events(business_id);
create index if not exists billing_events_status_idx on public.billing_events(status);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index if not exists usage_events_business_idx on public.usage_events(business_id, created_at desc);

alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.usage_events enable row level security;

create policy "subscriptions_members_select" on public.subscriptions for select using (public.is_business_member(business_id));
create policy "subscriptions_admin_update" on public.subscriptions for update using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));
create policy "billing_events_members_select" on public.billing_events for select using (business_id is not null and public.is_business_member(business_id));
create policy "usage_events_members_select" on public.usage_events for select using (public.is_business_member(business_id));

revoke insert, update, delete on public.subscriptions from authenticated, anon;
revoke insert, update, delete on public.billing_events from authenticated, anon;
revoke insert, update, delete on public.usage_events from authenticated, anon;
grant select on public.subscriptions, public.billing_events, public.usage_events to authenticated;

create or replace function public.ensure_free_subscription()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions(business_id, plan, status, provider)
  values (new.id, 'free', 'active', 'none')
  on conflict (business_id) do nothing;
  return new;
end;
$$;
revoke all on function public.ensure_free_subscription() from public;
grant execute on function public.ensure_free_subscription() to service_role;

-- Existing business rows receive the Free plan. The trigger is service-role-only to avoid client-created subscriptions.
insert into public.subscriptions(business_id) select id from public.businesses on conflict (business_id) do nothing;
