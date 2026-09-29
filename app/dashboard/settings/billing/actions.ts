"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/features/billing/config";

function clean(v: FormDataEntryValue | null) { return typeof v === "string" ? v.trim().slice(0, 120) : ""; }
const paidPlans: PlanId[] = ["starter", "pro", "agency"];

export async function requestPlanChange(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };
  const businessId = clean(formData.get("business_id"));
  const requestedPlan = clean(formData.get("plan")) as PlanId;
  if (!businessId || !getPlan(requestedPlan) || !paidPlans.includes(requestedPlan)) return { ok: false, message: "Select a valid paid plan." };
  const { data: membership } = await supabase.from("business_members").select("role").eq("business_id", businessId).eq("user_id", user.id).maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) return { ok: false, message: "Only a workspace owner or admin can change billing." };
  return { ok: false, message: "Paid checkout is not enabled yet. This checkpoint provides the secure billing architecture; connect a verified billing provider before taking payments." };
}

export async function requestCancellation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };
  const businessId = clean(formData.get("business_id"));
  if (!businessId) return { ok: false, message: "Business workspace not found." };
  const { data: membership } = await supabase.from("business_members").select("role").eq("business_id", businessId).eq("user_id", user.id).maybeSingle();
  if (!membership || !["owner", "admin"].includes(membership.role)) return { ok: false, message: "Only a workspace owner or admin can change billing." };
  return { ok: false, message: "Cancellation will be enabled after the verified billing provider is connected." };
}
