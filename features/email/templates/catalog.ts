import type { EmailTemplateKey } from "../types";

export const SYSTEM_EMAIL_TEMPLATES: Record<EmailTemplateKey, { name: string; subject: string; html: string; text: string }> = {
  "invoice.due_soon": {
    name: "Friendly reminder",
    subject: "Invoice {{invoice_number}} is due {{due_date}}",
    html: "<p>Hi {{client_name}},</p><p>A quick reminder that invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong> is due on {{due_date}}.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>",
    text: "Hi {{client_name}},\n\nA quick reminder that invoice {{invoice_number}} for {{amount}} {{currency}} is due on {{due_date}}.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}",
  },
  "invoice.due_today": {
    name: "Due today",
    subject: "Invoice {{invoice_number}} is due today",
    html: "<p>Hi {{client_name}},</p><p>Invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong> is due today.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>",
    text: "Hi {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} {{currency}} is due today.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}",
  },
  "invoice.overdue_3": {
    name: "3 days overdue",
    subject: "Invoice {{invoice_number}} is now 3 days overdue",
    html: "<p>Hi {{client_name}},</p><p>Invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong> is now 3 days overdue.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>",
    text: "Hi {{client_name}},\n\nInvoice {{invoice_number}} for {{amount}} {{currency}} is now 3 days overdue.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}",
  },
  "invoice.overdue_7": {
    name: "7 days overdue",
    subject: "Follow-up: invoice {{invoice_number}} is 7 days overdue",
    html: "<p>Hi {{client_name}},</p><p>Following up on invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong>, which is 7 days overdue.</p><p>{{payment_url}}</p><p>Thank you,<br>{{business_name}}</p>",
    text: "Hi {{client_name}},\n\nFollowing up on invoice {{invoice_number}} for {{amount}} {{currency}}, which is 7 days overdue.\n\n{{payment_url}}\n\nThank you,\n{{business_name}}",
  },
  "invoice.final_reminder": {
    name: "Final reminder",
    subject: "Final reminder: invoice {{invoice_number}}",
    html: "<p>Hi {{client_name}},</p><p>This is a final automated reminder about invoice <strong>{{invoice_number}}</strong> for <strong>{{amount}} {{currency}}</strong>.</p><p>{{payment_url}}</p><p>If payment has already been sent, please disregard this message.</p><p>Thank you,<br>{{business_name}}</p>",
    text: "Hi {{client_name}},\n\nThis is a final automated reminder about invoice {{invoice_number}} for {{amount}} {{currency}}.\n\n{{payment_url}}\n\nIf payment has already been sent, please disregard this message.\n\nThank you,\n{{business_name}}",
  },
};
