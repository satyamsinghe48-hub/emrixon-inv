import { SYSTEM_EMAIL_TEMPLATES } from "./templates/catalog";
import type { EmailTemplateKey, RenderContext } from "./types";

const TEMPLATE_ALIASES: Record<string, EmailTemplateKey> = {
  friendly_reminder: "invoice.due_soon",
  due_soon: "invoice.due_soon",
  due_today: "invoice.due_today",
  overdue_3: "invoice.overdue_3",
  overdue_7: "invoice.overdue_7",
  final_reminder: "invoice.final_reminder",
};

export const ALLOWED_TEMPLATE_KEYS = Object.keys(SYSTEM_EMAIL_TEMPLATES);

const ALLOWED_VARIABLES = new Set([
  "business_name", "client_name", "invoice_number", "amount", "currency", "due_date", "payment_url", "business_email",
]);

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}

function replaceVariables(input: string, context: RenderContext) {
  return input.replace(/{{\s*([a-z_]+)\s*}}/g, (match, key: string) => {
    if (!ALLOWED_VARIABLES.has(key)) return match;
    return escapeHtml(context[key as keyof RenderContext] ?? "");
  });
}

export function validateTemplateVariables(subject: string, html: string, text: string) {
  const source = `${subject}\n${html}\n${text}`;
  const matches = [...source.matchAll(/{{\s*([a-z_]+)\s*}}/g)].map((m) => m[1]);
  const unknown = [...new Set(matches.filter((key) => !ALLOWED_VARIABLES.has(key)))];
  return { valid: unknown.length === 0, unknown };
}

export function renderEmailTemplate(template: { template_key: string; subject: string; html_body: string; text_body: string }, context: RenderContext) {
  const key = (TEMPLATE_ALIASES[template.template_key] ?? template.template_key) as EmailTemplateKey;
  const fallback = SYSTEM_EMAIL_TEMPLATES[key];
  if (!fallback) throw new Error("Unsupported email template.");
  const validation = validateTemplateVariables(template.subject, template.html_body, template.text_body);
  if (!validation.valid) throw new Error(`Template contains unsupported variables: ${validation.unknown.join(", ")}`);
  return {
    subject: replaceVariables(template.subject, context),
    html: replaceVariables(template.html_body, context),
    text: replaceVariables(template.text_body, context),
  };
}

export function getSystemTemplate(templateKey: string) {
  const key = TEMPLATE_ALIASES[templateKey] ?? templateKey;
  const template = SYSTEM_EMAIL_TEMPLATES[key as EmailTemplateKey];
  if (!template) return null;
  return { template_key: key, subject: template.subject, html_body: template.html, text_body: template.text, name: template.name, active: true };
}

export function getAllowedTemplateVariables() {
  return [...ALLOWED_VARIABLES];
}
