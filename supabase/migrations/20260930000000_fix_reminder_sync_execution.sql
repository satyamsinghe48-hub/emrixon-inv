create or replace function public.sync_business_reminder_schedules(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.business_members bm
    where bm.business_id = p_business_id
      and bm.user_id = auth.uid()
      and bm.role in ('owner', 'admin')
  ) then
    raise exception 'Not authorized for this business';
  end if;

  perform public.ensure_default_reminder_rules(p_business_id);

  for invoice_id in
    select id
    from public.invoices
    where business_id = p_business_id
      and status in ('scheduled','due','overdue')
  loop
    perform public.sync_invoice_reminder_jobs(invoice_id, p_business_id);
  end loop;
end;
$$;

revoke all on function public.sync_business_reminder_schedules(uuid) from public;
grant execute on function public.sync_business_reminder_schedules(uuid) to authenticated;
grant execute on function public.sync_business_reminder_schedules(uuid) to service_role;
