"use server";
import { revalidatePath } from "next/cache";
import { sendReminderEmail } from "@/features/email/send";

export async function sendReminderNow(formData: FormData): Promise<void> {
  const jobId = typeof formData.get("job_id") === "string" ? String(formData.get("job_id")).trim() : "";
  if (!jobId) return;
  const result = await sendReminderEmail(jobId);
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard/settings/email/logs");
  void result;
}
