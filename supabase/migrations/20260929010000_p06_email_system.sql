-- EMRIXON Invoice Chaser P06: Email System v1
-- Provider-agnostic transactional email foundation. No customer/demo rows are seeded.

alter table public.businesses add column if not exists email_sender_name text;
alter table public.businesses add column if not exists email_reply_to text;

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  template_key text not null,
  name text not null,
  subject text not null,
  html_body text not null,
  text_body text not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint email_templates_key_nonempty check (length(trim(template_key)) > 0),
  constraint email_templates_name_nonempty check (length(trim(name)) > 0)
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  reminder_job_id uuid references public.reminder_jobs(id) on delete set null,
  recipient text not null,
  subject text not null,
  provider text not null,
  provider_message_id text,
  status text not null default 'queued',
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint email_logs_status_check check (status in ('queued','sending','sent','delivered','failed','bounced')),
  constraint email_logs_recipient_nonempty check (length(trim(recipient)) > 3)
);

create index if not exists email_templates_business_id_idx on public.email_templates(business_id);
create index if not exists email_templates_template_key_idx on public.email_templates(template_key);
create unique index if not exists email_templates_system_key_unique on public.email_templates(template_key) where business_id is null;
create unique index if not exists email_templates_business_key_unique on public.email_templates(business_id, template_key) where business_id is not null;
create index if not exists email_logs_business_id_idx on public.email_logs(business_id);
create index if not exists email_logs_invoice_id_idx on public.email_logs(invoice_id);
create index if not exists email_logs_reminder_job_id_idx on public.email_logs(reminder_job_id);
create index if not exists email_logs_status_idx on public.email_logs(status);
create index if not exists email_logs_created_at_idx on public.email_logs(created_at desc);

alter table public.email_templates enable row level security;
alter table public.email_logs enable row level security;

drop policy if exists "business members can read email templates" on public.email_templates;
create policy "business members can read email templates" on public.email_templates
for select using (
  business_id is null or exists (
    select 1 from public.business_members bm
    where bm.business_id = email_templates.business_id and bm.user_id = auth.uid()
  )
);

drop policy if exists "business members can manage email templates" on public.email_templates;
create policy "business members can manage email templates" on public.email_templates
for all using (
  business_id is not null and exists (
    select 1 from public.business_members bm
    where bm.business_id = email_templates.business_id and bm.user_id = auth.uid()
  )
) with check (
  business_id is not null and exists (
    select 1 from public.business_members bm
    where bm.business_id = email_templates.business_id and bm.user_id = auth.uid()
  )
);

drop policy if exists "business members can read email logs" on public.email_logs;
create policy "business members can read email logs" on public.email_logs
for select using (exists (
  select 1 from public.business_members bm
  where bm.business_id = email_logs.business_id and bm.user_id = auth.uid()
));

-- Sending/logging is intentionally server-only. Authenticated clients cannot insert/update logs.
drop policy if exists "business members cannot insert email logs" on public.email_logs;

-- Product-level system template catalog. These are not customer/demo records.
insert into public.email_templates (business_id, template_key, name, subject, html_body, text_body, active)
values
(null, 'invoice.due_soon', 'Friendly reminder', 'Invoice {{invoice_number}} is due {{due_date}}', '<p>Hi {{client_name}},</p><p>A quick reminder that invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong> is due on {{due_date}}.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>', 'Hi {{client_name}},\n\nA quick reminder that invoice {{invoice_number}} for {{amount}} {{currency}} is due on {{due_date}}.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}', true),
(null, 'invoice.due_today', 'Due today', 'Invoice {{invoice_number}} is due today', '<p>Hi {{client_name}},</p><p>Invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong> is due today.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>', 'Hi {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} {{currency}} is due today.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}', true),
(null, 'invoice.overdue_3', '3 days overdue', 'Invoice {{invoice_number}} is now 3 days overdue', '<p>Hi {{client_name}},</p><p>Invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong> is now 3 days overdue.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>', 'Hi {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} {{currency}} is now 3 days overdue.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}', true),
(null, 'invoice.overdue_7', '7 days overdue', 'Follow-up: invoice {{invoice_number}} is 7 days overdue', '<p>Hi {{client_name}},</p><p>Following up on invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong>, which is 7 days overdue.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>', 'Hi {{client_name}},\n\nFollowing up on invoice {{invoice_number}} for {{amount}} {{currency}}, which is 7 days overdue.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}', true),
(null, 'invoice.final_reminder', 'Final reminder', 'Final reminder: invoice {{invoice_number}}', '<p>Hi {{client_name}},</p><p>This is a final automated reminder about invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong>.</p><p>{{payment_url}}</p><p>If payment has already been sent, please disregard this message.</p><p>Thank you,<br>{{business_name}}</p>', 'Hi {{client_name}},\n\nThis is a final automated reminder about invoice {{invoice_number}} for {{amount}} {{currency}}.\n\n{{payment_url}}\n\nIf payment has already been sent, please disregard this message.\n\nThank you,\n{{business_name}}', true)
;
