import { getEmailEnv } from "@/lib/env/server";
import type { SendEmailInput, SendEmailResult } from "../types";

export async function sendWithResend(input: SendEmailInput): Promise<SendEmailResult> {
  const env = getEmailEnv();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: input.from, to: [input.to], reply_to: input.replyTo, subject: input.subject, html: input.html, text: input.text }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({})) as { id?: string; message?: string; error?: string };
  if (!response.ok) return { provider: "resend", status: "failed", error: data.message || data.error || `Resend returned HTTP ${response.status}` };
  return { provider: "resend", status: "sent", provider_message_id: data.id };
}
