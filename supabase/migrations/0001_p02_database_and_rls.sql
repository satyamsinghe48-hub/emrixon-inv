-- EMRIXON Invoice Chaser — P02
-- Database foundation + multi-tenant RLS
-- Safe to run on a NEW Supabase project.
-- This migration does not create demo/customer data.

create extension if not exists pgcrypto;

create type public.business_member_role as enum ('owner', 'admin', 'member');
create type public.invoice_status as enum ('draft', 'scheduled', 'due', 'overdue', 'paid', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 160),
  logo_url text,
  website text,
  support_email text,
  default_currency varchar(3) not null default 'USD' check (default_currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_member_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  primary key (business_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  company_name text,
  contact_name text,
  email text not null,
  phone text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (company_name is not null or contact_name is not null),
  check (char_length(trim(email)) >= 3)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_number text not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency varchar(3) not null check (currency ~ '^[A-Z]{3}$'),
  issue_date date not null,
  due_date date not null,
  payment_url text,
  status public.invoice_status not null default 'draft',
  notes text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, invoice_number),
  check (due_date >= issue_date),
  check ((status = 'paid') or paid_at is null),
  check ((status = 'cancelled') or cancelled_at is null)
);

create table public.reminder_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  offset_days integer not null check (offset_days between -365 and 365),
  template_key text not null check (char_length(trim(template_key)) between 1 and 100),
  active boolean not null default true,
  stop_when_paid boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (business_id, name, offset_days)
);

create index businesses_owner_id_idx on public.businesses(owner_id);
create index business_members_user_id_idx on public.business_members(user_id);
create index clients_business_id_idx on public.clients(business_id);
create index clients_business_email_idx on public.clients(business_id, lower(email));
create index invoices_business_id_idx on public.invoices(business_id);
create index invoices_client_id_idx on public.invoices(client_id);
create index invoices_status_due_date_idx on public.invoices(business_id, status, due_date);
create index reminder_rules_business_id_idx on public.reminder_rules(business_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger reminder_rules_set_updated_at
before update on public.reminder_rules
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_business_member(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = p_business_id
      and bm.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = p_business_id
      and bm.user_id = auth.uid()
      and bm.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_business_member(uuid) from public;
revoke all on function public.can_manage_business(uuid) from public;
grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.can_manage_business(uuid) to authenticated;

create or replace function public.add_business_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_members (business_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (business_id, user_id)
  do update set role = 'owner';
  return new;
end;
$$;

revoke all on function public.add_business_owner_membership() from public;
grant execute on function public.add_business_owner_membership() to authenticated;
grant execute on function public.add_business_owner_membership() to service_role;

create trigger business_owner_membership
after insert on public.businesses
for each row execute function public.add_business_owner_membership();

create or replace function public.protect_business_owner_membership()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.role = 'owner' and (new.role is distinct from 'owner' or new.user_id is distinct from old.user_id) then
    raise exception 'The business owner membership cannot be changed';
  end if;
  if old.role = 'owner' and tg_op = 'DELETE' then
    raise exception 'The business owner membership cannot be deleted';
  end if;
  return new;
end;
$$;

create trigger protect_business_owner_membership
before update or delete on public.business_members
for each row execute function public.protect_business_owner_membership();

create or replace function public.prevent_business_owner_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Business owner cannot be changed in this operation';
  end if;
  return new;
end;
$$;

create trigger businesses_owner_immutable
before update on public.businesses
for each row execute function public.prevent_business_owner_change();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.reminder_rules enable row level security;

create policy profiles_select_own
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy profiles_insert_own
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy businesses_select_member
on public.businesses for select
to authenticated
using (public.is_business_member(id));

create policy businesses_insert_owner
on public.businesses for insert
to authenticated
with check (owner_id = auth.uid());

create policy businesses_update_manager
on public.businesses for update
to authenticated
using (public.can_manage_business(id))
with check (public.can_manage_business(id));

create policy businesses_delete_owner
on public.businesses for delete
to authenticated
using (owner_id = auth.uid());

create policy business_members_select_member
on public.business_members for select
to authenticated
using (public.is_business_member(business_id));

create policy business_members_insert_manager
on public.business_members for insert
to authenticated
with check (public.can_manage_business(business_id));

create policy business_members_update_manager
on public.business_members for update
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

create policy business_members_delete_manager
on public.business_members for delete
to authenticated
using (public.can_manage_business(business_id));

create policy clients_select_member
on public.clients for select
to authenticated
using (public.is_business_member(business_id));

create policy clients_insert_member
on public.clients for insert
to authenticated
with check (public.is_business_member(business_id));

create policy clients_update_member
on public.clients for update
to authenticated
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

create policy clients_delete_member
on public.clients for delete
to authenticated
using (public.is_business_member(business_id));

create policy invoices_select_member
on public.invoices for select
to authenticated
using (public.is_business_member(business_id));

create policy invoices_insert_member
on public.invoices for insert
to authenticated
with check (
  public.is_business_member(business_id)
  and exists (
    select 1
    from public.clients c
    where c.id = invoices.client_id
      and c.business_id = invoices.business_id
  )
);

create policy invoices_update_member
on public.invoices for update
to authenticated
using (public.is_business_member(business_id))
with check (
  public.is_business_member(business_id)
  and exists (
    select 1
    from public.clients c
    where c.id = invoices.client_id
      and c.business_id = invoices.business_id
  )
);

create policy invoices_delete_member
on public.invoices for delete
to authenticated
using (public.is_business_member(business_id));

create policy reminder_rules_select_member
on public.reminder_rules for select
to authenticated
using (public.is_business_member(business_id));

create policy reminder_rules_insert_manager
on public.reminder_rules for insert
to authenticated
with check (public.can_manage_business(business_id));

create policy reminder_rules_update_manager
on public.reminder_rules for update
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

create policy reminder_rules_delete_manager
on public.reminder_rules for delete
to authenticated
using (public.can_manage_business(business_id));

-- Explicitly revoke broad table access and grant only the application roles.
revoke all on table public.profiles, public.businesses, public.business_members,
  public.clients, public.invoices, public.reminder_rules from anon;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.businesses to authenticated;
grant select, insert, update, delete on public.business_members to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.reminder_rules to authenticated;

comment on table public.profiles is 'One profile row per authenticated Supabase user.';
comment on table public.businesses is 'Tenant/workspace root. owner_id is immutable after creation.';
comment on table public.business_members is 'Tenant membership and role mapping.';
comment on table public.clients is 'Invoice recipients scoped to a business.';
comment on table public.invoices is 'Core invoice records; payment collection is external in V1.';
comment on table public.reminder_rules is 'Reminder configuration foundation; scheduling engine arrives in P05.';
