import { sendWithResend } from "./providers/resend";
import type { SendEmailInput, SendEmailResult } from "./types";

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  // Provider selection stays in one place so Resend can later be replaced without changing reminder logic.
  return sendWithResend(input);
}
