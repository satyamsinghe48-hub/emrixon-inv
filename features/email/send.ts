import { getEmailEnv } from "@/lib/env/server";
import { getCurrentBusiness } from "@/lib/business/current";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./provider";
import { getSystemTemplate, renderEmailTemplate } from "./render";

function safeEmail(value: string | null | undefined) {
  return !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function displayAmount(amount: number, currency: string) {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount); }
  catch { return `${amount.toFixed(2)} ${currency}`; }
}

type SendResult = { ok: boolean; message: string; permanent?: boolean; cancelled?: boolean };

async function getTemplateForBusiness(supabase: ReturnType<typeof createAdminClient>, businessId: string, templateKey: string) {
  const { data } = await supabase.from("email_templates").select("template_key,name,subject,html_body,text_body,active").eq("business_id", businessId).eq("template_key", templateKey).maybeSingle();
  if (data?.active) return data;
  return getSystemTemplate(templateKey);
}

async function sendReminderEmailCore(reminderJobId: string, businessId: string, allowProcessing = false): Promise<SendResult> {
  const admin = createAdminClient();
  const { data: job } = await admin.from("reminder_jobs").select("id,business_id,invoice_id,status,reminder_rule_id").eq("id", reminderJobId).eq("business_id", businessId).maybeSingle();
  if (!job) return { ok: false, message: "Reminder job not found.", permanent: true };
  if (["sent", "cancelled", "dead_letter"].includes(job.status) || (job.status === "processing" && !allowProcessing)) return { ok: false, message: "Reminder job is currently being processed or is no longer sendable.", permanent: true };

  const { data: invoice } = await admin.from("invoices").select("id,client_id,invoice_number,amount,currency,due_date,payment_url,status,paid_at,cancelled_at").eq("id", job.invoice_id).eq("business_id", businessId).maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice not found.", permanent: true };
  if (invoice.status === "paid" || invoice.status === "cancelled" || invoice.paid_at || invoice.cancelled_at) {
    await admin.from("reminder_jobs").update({ status: "cancelled", last_error: null, locked_at: null, locked_by: null, next_retry_at: null, updated_at: new Date().toISOString() }).eq("id", job.id).eq("business_id", businessId);
    return { ok: false, message: "The invoice is already paid or cancelled. No email was sent.", cancelled: true };
  }
  if (allowProcessing && !["scheduled", "due", "overdue"].includes(invoice.status)) {
    await admin.from("reminder_jobs").update({ status: "cancelled", last_error: null, locked_at: null, locked_by: null, next_retry_at: null, updated_at: new Date().toISOString() }).eq("id", job.id).eq("business_id", businessId);
    return { ok: false, message: "This invoice is not in an automation-eligible state. No email was sent.", cancelled: true };
  }

  const { data: business } = await admin.from("businesses").select("id,name,support_email,email_sender_name,email_reply_to,automation_enabled").eq("id", businessId).maybeSingle();
  if (!business) return { ok: false, message: "Business workspace not found.", permanent: true };
  if (allowProcessing && business.automation_enabled === false) {
    await admin.from("reminder_jobs").update({ status: "cancelled", last_error: null, locked_at: null, locked_by: null, next_retry_at: null, updated_at: new Date().toISOString() }).eq("id", job.id).eq("business_id", businessId);
    return { ok: false, message: "Automatic reminders are paused. No email was sent.", cancelled: true };
  }

  const { data: client } = await admin.from("clients").select("email,contact_name,company_name").eq("id", invoice.client_id).eq("business_id", businessId).maybeSingle();
  if (!client || !safeEmail(client.email)) return { ok: false, message: "Client email is missing or invalid.", permanent: true };

  const { data: rule } = await admin.from("reminder_rules").select("template_id").eq("id", job.reminder_rule_id).eq("business_id", businessId).maybeSingle();
  const template = await getTemplateForBusiness(admin, businessId, rule?.template_id || "invoice.due_soon");
  if (!template) return { ok: false, message: "Email template not found.", permanent: true };

  const rendered = renderEmailTemplate(template, {
    business_name: business.name,
    client_name: client.contact_name || client.company_name || "there",
    invoice_number: invoice.invoice_number,
    amount: displayAmount(Number(invoice.amount), invoice.currency),
    currency: invoice.currency,
    due_date: invoice.due_date,
    payment_url: invoice.payment_url ? `Pay invoice: ${invoice.payment_url}` : `Please contact ${business.name} to arrange payment.`,
    business_email: business.support_email || "",
  });

  const env = getEmailEnv();
  const fromAddressMatch = env.emailFrom.match(/<([^>]+)>$/);
  const fromAddress = fromAddressMatch?.[1]?.trim() || env.emailFrom.trim();
  const from = business.email_sender_name ? `${business.email_sender_name} <${fromAddress}>` : env.emailFrom;
  const replyTo = business.email_reply_to || business.support_email || env.emailReplyTo;
  const { data: log } = await admin.from("email_logs").insert({ business_id: businessId, invoice_id: invoice.id, reminder_job_id: job.id, recipient: client.email, subject: rendered.subject, provider: "resend", status: "sending" }).select("id").single();
  if (!log) return { ok: false, message: "Could not create email log." };

  const result = await sendEmail({ to: client.email, from, replyTo: safeEmail(replyTo) ? replyTo : undefined, subject: rendered.subject, html: rendered.html, text: rendered.text });
  const now = new Date().toISOString();
  if (result.status === "sent") {
    await admin.from("email_logs").update({ status: "sent", provider_message_id: result.provider_message_id || null, sent_at: now, updated_at: now }).eq("id", log.id).eq("business_id", businessId);
    await admin.from("reminder_jobs").update({ status: "sent", sent_at: now, last_error: null, locked_at: null, locked_by: null, next_retry_at: null, updated_at: now }).eq("id", job.id).eq("business_id", businessId);
    return { ok: true, message: "Reminder email sent." };
  }
  await admin.from("email_logs").update({ status: "failed", error_message: result.error || "Email provider failed.", failed_at: now, updated_at: now }).eq("id", log.id).eq("business_id", businessId);
  return { ok: false, message: result.error || "Email provider failed." };
}

export async function sendReminderEmailForWorker(reminderJobId: string, businessId: string) {
  return sendReminderEmailCore(reminderJobId, businessId, true);
}

export async function sendReminderEmail(reminderJobId: string) {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return { ok: false, message: "Business workspace not found." };
  const { data: job } = await supabase.from("reminder_jobs").select("id,business_id").eq("id", reminderJobId).eq("business_id", business.id).maybeSingle();
  if (!job) return { ok: false, message: "Reminder job not found." };
  return sendReminderEmailCore(reminderJobId, business.id);
}
