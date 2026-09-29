"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusiness } from "@/lib/business/current";
import { sendEmail } from "@/features/email/provider";
import { renderEmailTemplate, validateTemplateVariables, ALLOWED_TEMPLATE_KEYS } from "@/features/email/render";
import { getEmailEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";

function clean(value: FormDataEntryValue | null) { return typeof value === "string" ? value.trim() : ""; }
function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export async function updateEmailSettings(_prev: { ok: boolean; message: string }, formData: FormData) {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return { ok: false, message: "Business workspace not found." };
  const senderName = clean(formData.get("email_sender_name"));
  const replyTo = clean(formData.get("email_reply_to")).toLowerCase();
  if (replyTo && !validEmail(replyTo)) return { ok: false, message: "Enter a valid reply-to email." };
  const { error } = await supabase.from("businesses").update({ email_sender_name: senderName || null, email_reply_to: replyTo || null }).eq("id", business.id);
  if (error) return { ok: false, message: "We could not save email settings." };
  revalidatePath("/dashboard/settings/email");
  return { ok: true, message: "Email settings saved." };
}

export async function saveEmailTemplate(_prev: { ok: boolean; message: string }, formData: FormData) {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return { ok: false, message: "Business workspace not found." };
  const templateKey = clean(formData.get("template_key"));
  const name = clean(formData.get("name"));
  const subject = clean(formData.get("subject"));
  const htmlBody = clean(formData.get("html_body"));
  const textBody = clean(formData.get("text_body"));
  if (!templateKey || !name || !subject || !htmlBody || !textBody) return { ok: false, message: "All template fields are required." };
  if (!ALLOWED_TEMPLATE_KEYS.includes(templateKey)) return { ok: false, message: "Select a supported invoice reminder template." };
  if (name.length > 120 || subject.length > 180 || htmlBody.length > 20000 || textBody.length > 12000) return { ok: false, message: "Email template content is too long." };
  const validation = validateTemplateVariables(subject, htmlBody, textBody);
  if (!validation.valid) return { ok: false, message: `Unsupported variables: ${validation.unknown.join(", ")}` };
  const { error } = await supabase.from("email_templates").upsert({ business_id: business.id, template_key: templateKey, name, subject, html_body: htmlBody, text_body: textBody, active: true, updated_at: new Date().toISOString() }, { onConflict: "business_id,template_key" });
  if (error) return { ok: false, message: "We could not save this template." };
  revalidatePath("/dashboard/settings/email/templates");
  return { ok: true, message: "Template saved." };
}

export async function sendTestEmail(_prev: { ok: boolean; message: string }, formData: FormData) {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return { ok: false, message: "Business workspace not found." };
  const recipient = clean(formData.get("recipient")).toLowerCase();
  const templateKey = clean(formData.get("template_key"));
  if (!validEmail(recipient)) return { ok: false, message: "Enter a valid test recipient email." };
  if (!ALLOWED_TEMPLATE_KEYS.includes(templateKey)) return { ok: false, message: "Select a supported invoice reminder template." };
  const { data: template } = await supabase.from("email_templates").select("template_key,subject,html_body,text_body,active").eq("business_id", business.id).eq("template_key", templateKey).maybeSingle();
  const fallback = template || (await import("@/features/email/render")).getSystemTemplate(templateKey);
  if (!fallback || !fallback.active) return { ok: false, message: "Template not found or inactive." };
  const rendered = renderEmailTemplate(fallback, { business_name: business.name, client_name: "Test Client", invoice_number: "TEST-001", amount: "$100.00", currency: business.default_currency, due_date: new Date().toISOString().slice(0, 10), payment_url: "https://example.com/pay/test", business_email: business.support_email || "" });
  const env = getEmailEnv();
  const replyTo = business.email_reply_to || business.support_email || env.emailReplyTo;
  const admin = createAdminClient();
  const logResult = await admin.from("email_logs").insert({ business_id: business.id, recipient, subject: `[TEST] ${rendered.subject}`, provider: "resend", status: "sending" }).select("id").single();
  if (logResult.error || !logResult.data) return { ok: false, message: "Could not create test email log." };
  const fromAddressMatch = env.emailFrom.match(/<([^>]+)>$/);
  const fromAddress = fromAddressMatch?.[1]?.trim() || env.emailFrom.trim();
  const from = business.email_sender_name ? `${business.email_sender_name} <${fromAddress}>` : env.emailFrom;
  const result = await sendEmail({ to: recipient, from, replyTo: validEmail(replyTo || "") ? replyTo : undefined, subject: `[TEST] ${rendered.subject}`, html: rendered.html, text: rendered.text });
  if (result.status === "sent") {
    await admin.from("email_logs").update({ status: "sent", provider_message_id: result.provider_message_id || null, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", logResult.data.id).eq("business_id", business.id);
    return { ok: true, message: "Test email sent." };
  }
  await admin.from("email_logs").update({ status: "failed", error_message: result.error || "Provider failed", failed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", logResult.data.id).eq("business_id", business.id);
  return { ok: false, message: result.error || "Test email failed." };
}
