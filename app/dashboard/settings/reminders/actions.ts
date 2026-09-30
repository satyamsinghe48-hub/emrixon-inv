"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business/current";
import { getBusinessSubscription } from "@/features/billing/subscription";
import { canUseCustomSchedules } from "@/features/billing/entitlements";
import { reminderRuleSchema } from "@/features/reminders/validation";

function textValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

const TEMPLATE_KEYS = new Set([
  "invoice.due_soon",
  "invoice.due_today",
  "invoice.overdue_3",
  "invoice.overdue_7",
  "invoice.final_reminder",
]);

async function workspaceContext() {
  const current = await getCurrentBusiness();
  if (!current.user || !current.business) return { ...current, error: "Business workspace not found." };
  if (!current.role || !["owner", "admin"].includes(current.role)) return { ...current, error: "Only a workspace owner or admin can change reminder settings." };
  return { ...current, error: null };
}

export async function setAutomationEnabled(formData: FormData) {
  const { supabase, business, error } = await workspaceContext();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };
  const enabled = formData.get("enabled") === "true";
  const { error: updateError } = await supabase.from("businesses").update({ automation_enabled: enabled }).eq("id", business.id);
  if (updateError) return { ok: false, message: "Could not update automation settings." };
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard/settings/reminders");
  return { ok: true, message: enabled ? "Automatic reminders enabled." : "Automatic reminders paused." };
}

export async function updateReminderRule(formData: FormData) {
  const { supabase, business, error } = await workspaceContext();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };

  const { planId } = await getBusinessSubscription(supabase, business.id);
  if (!canUseCustomSchedules(planId)) return { ok: false, message: "Custom reminder schedules require Starter or higher." };

  const id = textValue(formData.get("id"));
  const name = textValue(formData.get("name"));
  const offsetDaysRaw = textValue(formData.get("offset_days"));
  const offsetDays = Number(offsetDaysRaw);
  const offsetType = textValue(formData.get("offset_type"));
  const templateId = textValue(formData.get("template_id"));
  const active = formData.get("active") !== "false";

  const parsed = reminderRuleSchema.safeParse({ name, offset_days: offsetDays, offset_type: offsetType, template_id: templateId || null, active });
  if (!parsed.success || (templateId && !TEMPLATE_KEYS.has(templateId))) return { ok: false, message: "Enter valid reminder rule details." };
  if (!id) return { ok: false, message: "Reminder rule not found." };

  const { error: updateError } = await supabase.from("reminder_rules").update({
    name: parsed.data.name,
    offset_days: parsed.data.offset_days,
    offset_type: parsed.data.offset_type,
    template_id: parsed.data.template_id || null,
    active: parsed.data.active,
  }).eq("id", id).eq("business_id", business.id);

  if (updateError) return { ok: false, message: "Could not save the reminder rule." };
  const { error: syncError } = await supabase.rpc("sync_business_reminder_schedules", { p_business_id: business.id });
  if (syncError) return { ok: false, message: "Rule saved, but schedules could not be refreshed. Please retry." };
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard/settings/reminders");
  return { ok: true, message: "Reminder rule saved." };
}

export async function createReminderRule(formData: FormData): Promise<void> {
  const { supabase, business, error } = await workspaceContext();
  if (error || !business) return;
  const { planId } = await getBusinessSubscription(supabase, business.id);
  if (!canUseCustomSchedules(planId)) return;

  const name = textValue(formData.get("name"));
  const offsetDays = Number(textValue(formData.get("offset_days")));
  const offsetType = textValue(formData.get("offset_type"));
  const templateId = textValue(formData.get("template_id"));
  const parsed = reminderRuleSchema.safeParse({ name, offset_days: offsetDays, offset_type: offsetType, template_id: templateId || null, active: true });
  if (!parsed.success || (templateId && !TEMPLATE_KEYS.has(templateId))) return;

  const { error: insertError } = await supabase.from("reminder_rules").insert({
    business_id: business.id,
    name: parsed.data.name,
    offset_days: parsed.data.offset_days,
    offset_type: parsed.data.offset_type,
    template_id: parsed.data.template_id || null,
    active: true,
  });
  if (insertError) return;
  const { error: syncError } = await supabase.rpc("sync_business_reminder_schedules", { p_business_id: business.id });
  if (syncError) return;
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard/settings/reminders");
  return;
}
