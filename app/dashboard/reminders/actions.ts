"use server";
import { revalidatePath } from "next/cache";
import { sendReminderEmail } from "@/features/email/send";

export async function sendReminderNow(formData: FormData) {
  const jobId = typeof formData.get("job_id") === "string" ? String(formData.get("job_id")).trim() : "";
  if (!jobId) return { ok: false, message: "Reminder job not found." };
  const result = await sendReminderEmail(jobId);
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard/settings/email/logs");
  return result;
}
