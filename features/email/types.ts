export const EMAIL_TEMPLATE_KEYS = [
  "invoice.due_soon",
  "invoice.due_today",
  "invoice.overdue_3",
  "invoice.overdue_7",
  "invoice.final_reminder",
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];
export type EmailLogStatus = "queued" | "sending" | "sent" | "delivered" | "failed" | "bounced";

export type EmailTemplate = {
  id: string;
  business_id: string | null;
  template_key: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type EmailLog = {
  id: string;
  business_id: string;
  invoice_id: string | null;
  reminder_job_id: string | null;
  recipient: string;
  subject: string;
  provider: string;
  provider_message_id: string | null;
  status: EmailLogStatus;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type RenderContext = {
  business_name: string;
  client_name: string;
  invoice_number: string;
  amount: string;
  currency: string;
  due_date: string;
  payment_url: string;
  business_email: string;
};

export type SendEmailInput = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = {
  provider: string;
  provider_message_id?: string;
  status: "sent" | "failed";
  error?: string;
};
