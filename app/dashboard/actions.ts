"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cleanString, isValidEmail, isValidHttpUrl, isValidCurrency, isValidTimeZone } from "@/lib/security/validation";

function clean(value: FormDataEntryValue | null) {
  return cleanString(value);
}

export async function createBusiness(_prevState: { ok: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const name = clean(formData.get("name"));
  const website = clean(formData.get("website"));
  const supportEmail = clean(formData.get("support_email"));
  const currency = clean(formData.get("default_currency")).toUpperCase() || "USD";
  const timezone = clean(formData.get("timezone")) || "UTC";

  if (!name || name.length > 160) return { ok: false, message: "Business name is required and must be 160 characters or fewer." };
  if (website && !isValidHttpUrl(website)) return { ok: false, message: "Website must use http:// or https://." };
  if (supportEmail && !isValidEmail(supportEmail)) return { ok: false, message: "Enter a valid support email." };
  if (!isValidCurrency(currency)) return { ok: false, message: "Currency must be a 3-letter code." };
  if (!isValidTimeZone(timezone)) return { ok: false, message: "Enter a valid timezone." };

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    website: website || null,
    support_email: supportEmail || null,
    default_currency: currency,
    timezone,
  });

  if (error) return { ok: false, message: "We could not create the business. Please check your details and try again." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/business");
  revalidatePath("/dashboard/settings/reminders");
  return { ok: true, message: "Saved successfully." };
}

export async function updateBusiness(_prevState: { ok: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const { data: membership } = await supabase.from("business_members").select("business_id, role").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
  const businessId = membership?.business_id;
  const name = clean(formData.get("name"));
  const website = clean(formData.get("website"));
  const supportEmail = clean(formData.get("support_email"));
  const currency = clean(formData.get("default_currency")).toUpperCase();
  const timezone = clean(formData.get("timezone"));

  if (!businessId || !membership || !["owner", "admin"].includes(membership.role)) return { ok: false, message: "You do not have permission to edit this workspace." };
  if (!name || name.length > 160) return { ok: false, message: "Business name is required and must be 160 characters or fewer." };
  if (website && !isValidHttpUrl(website)) return { ok: false, message: "Website must use http:// or https://." };
  if (supportEmail && !isValidEmail(supportEmail)) return { ok: false, message: "Enter a valid support email." };
  if (!isValidCurrency(currency)) return { ok: false, message: "Currency must be a 3-letter code." };
  if (!isValidTimeZone(timezone)) return { ok: false, message: "Enter a valid timezone." };

  const { error } = await supabase.from("businesses").update({
    name,
    website: website || null,
    support_email: supportEmail || null,
    default_currency: currency,
    timezone: timezone || "UTC",
  }).eq("id", businessId);

  if (error) return { ok: false, message: "We could not save the business settings." };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/business");
  revalidatePath("/dashboard/settings/reminders");
  return { ok: true, message: "Saved successfully." };
}

export async function createClientRecord(_prevState: { ok: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const { data: membership } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
  const businessId = membership?.business_id ?? "";
  const companyName = clean(formData.get("company_name"));
  const contactName = clean(formData.get("contact_name"));
  const email = clean(formData.get("email")).toLowerCase();
  const phone = clean(formData.get("phone"));
  const notes = clean(formData.get("notes"));

  if (!businessId) return { ok: false, message: "Business workspace not found." };
  if (!companyName && !contactName) return { ok: false, message: "Add a company name or contact name." };
  if (companyName.length > 160 || contactName.length > 160 || phone.length > 50 || notes.length > 4000) return { ok: false, message: "One or more client fields are too long." };
  if (!isValidEmail(email)) return { ok: false, message: "Enter a valid client email." };

  const { error } = await supabase.from("clients").insert({
    business_id: businessId,
    company_name: companyName || null,
    contact_name: contactName || null,
    email,
    phone: phone || null,
    notes: notes || null,
  });

  if (error) return { ok: false, message: "We could not create this client. Please try again." };
  revalidatePath("/dashboard/clients");
  return { ok: true, message: "Saved successfully." };
}

export async function updateClientRecord(_prevState: { ok: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session has expired. Please sign in again." };

  const clientId = clean(formData.get("client_id"));
  const { data: membership } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
  const businessId = membership?.business_id ?? "";
  const companyName = clean(formData.get("company_name"));
  const contactName = clean(formData.get("contact_name"));
  const email = clean(formData.get("email")).toLowerCase();
  const phone = clean(formData.get("phone"));
  const notes = clean(formData.get("notes"));

  if (!clientId || !businessId) return { ok: false, message: "Client record not found." };
  if (!companyName && !contactName) return { ok: false, message: "Add a company name or contact name." };
  if (companyName.length > 160 || contactName.length > 160 || phone.length > 50 || notes.length > 4000) return { ok: false, message: "One or more client fields are too long." };
  if (!isValidEmail(email)) return { ok: false, message: "Enter a valid client email." };

  const { error } = await supabase.from("clients").update({
    company_name: companyName || null,
    contact_name: contactName || null,
    email,
    phone: phone || null,
    notes: notes || null,
  }).eq("id", clientId).eq("business_id", businessId);

  if (error) return { ok: false, message: "We could not save this client." };
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { ok: true, message: "Saved successfully." };
}

export async function archiveClient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const clientId = clean(formData.get("client_id"));
  const { data: membership } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
  const businessId = membership?.business_id ?? "";
  if (!clientId || !businessId) return;

  const { error } = await supabase.from("clients").update({ archived_at: new Date().toISOString() })
    .eq("id", clientId).eq("business_id", businessId);
  if (error) return;
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return;
}
