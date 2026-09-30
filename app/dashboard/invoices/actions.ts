"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business/current";
import { getBusinessSubscription } from "@/features/billing/subscription";
import { canCreateInvoice } from "@/features/billing/entitlements";
import { isSafeAmount, isValidCurrency, isValidHttpUrl, isValidIsoDate } from "@/lib/security/validation";

export type InvoiceActionState = { ok: boolean; message: string; id?: string };

const CURRENCIES = new Set(["USD", "EUR", "GBP", "INR", "AUD", "CAD", "NZD", "SGD", "AED"]);

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}


async function getBusinessOrError() {
  const current = await getCurrentBusiness();
  if (!current.user) return { ...current, error: "Your session has expired. Please sign in again." };
  if (!current.business) return { ...current, error: "Business workspace not found." };
  return { ...current, error: null };
}

export async function createInvoice(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  const { supabase, business, error } = await getBusinessOrError();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };

  const { planId } = await getBusinessSubscription(supabase, business.id);
  const { count: activeInvoiceCount } = await supabase.from("invoices").select("id", { count: "exact", head: true }).eq("business_id", business.id).in("status", ["draft", "scheduled", "due", "overdue"]);
  if (!canCreateInvoice(planId, activeInvoiceCount ?? 0)) return { ok: false, message: `You have reached the ${planId} plan active invoice limit. Upgrade your plan or archive/complete an existing invoice.` };

  const clientId = clean(formData.get("client_id"));
  const invoiceNumber = clean(formData.get("invoice_number"));
  const amountRaw = clean(formData.get("amount"));
  const currency = clean(formData.get("currency")).toUpperCase() || business.default_currency;
  const issueDate = clean(formData.get("issue_date"));
  const dueDate = clean(formData.get("due_date"));
  const paymentUrl = clean(formData.get("payment_url"));
  const notes = clean(formData.get("notes"));
  const amount = Number(amountRaw);

  if (!clientId) return { ok: false, message: "Select a client." };
  if (!invoiceNumber || invoiceNumber.length > 80) return { ok: false, message: "Enter a valid invoice number." };
  if (!isSafeAmount(amount)) return { ok: false, message: "Enter a valid positive amount with up to 2 decimal places." };
  if (!CURRENCIES.has(currency) && !isValidCurrency(currency)) return { ok: false, message: "Enter a valid 3-letter currency code." };
  if (!isValidIsoDate(issueDate) || !isValidIsoDate(dueDate)) return { ok: false, message: "Enter valid issue and due dates." };
  if (dueDate < issueDate) return { ok: false, message: "Due date cannot be before the issue date." };
  if (!isValidHttpUrl(paymentUrl)) return { ok: false, message: "Payment URL must use http:// or https://." };

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("business_id", business.id)
    .is("archived_at", null)
    .maybeSingle();
  if (clientError || !client) return { ok: false, message: "Selected client is not available." };

  const { data, error: insertError } = await supabase.from("invoices").insert({
    business_id: business.id,
    client_id: client.id,
    invoice_number: invoiceNumber,
    amount,
    currency,
    issue_date: issueDate,
    due_date: dueDate,
    payment_url: paymentUrl || null,
    status: "scheduled",
    notes: notes || null,
  }).select("id").single();

  if (insertError) {
    if (insertError.code === "23505") return { ok: false, message: "Invoice number already exists in this business." };
    return { ok: false, message: "We could not create this invoice. Please check your details and try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  return { ok: true, message: "Invoice created.", id: data.id };
}

export async function updateInvoice(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  const { supabase, business, error } = await getBusinessOrError();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };

  const invoiceId = clean(formData.get("invoice_id"));
  const clientId = clean(formData.get("client_id"));
  const invoiceNumber = clean(formData.get("invoice_number"));
  const amountRaw = clean(formData.get("amount"));
  const currency = clean(formData.get("currency")).toUpperCase() || business.default_currency;
  const issueDate = clean(formData.get("issue_date"));
  const dueDate = clean(formData.get("due_date"));
  const paymentUrl = clean(formData.get("payment_url"));
  const notes = clean(formData.get("notes"));
  const amount = Number(amountRaw);

  if (!invoiceId || !clientId) return { ok: false, message: "Invoice record not found." };
  const { data: existing } = await supabase.from("invoices").select("status").eq("id", invoiceId).eq("business_id", business.id).maybeSingle();
  if (!existing) return { ok: false, message: "Invoice record not found." };
  if (existing.status === "paid" || existing.status === "cancelled") return { ok: false, message: "Paid or cancelled invoices cannot be edited." };
  if (!invoiceNumber || invoiceNumber.length > 80) return { ok: false, message: "Enter a valid invoice number." };
  if (!isSafeAmount(amount)) return { ok: false, message: "Enter a valid positive amount with up to 2 decimal places." };
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, message: "Enter a valid 3-letter currency code." };
  if (!isValidIsoDate(issueDate) || !isValidIsoDate(dueDate)) return { ok: false, message: "Enter valid issue and due dates." };
  if (dueDate < issueDate) return { ok: false, message: "Due date cannot be before the issue date." };
  if (!isValidHttpUrl(paymentUrl)) return { ok: false, message: "Payment URL must use http:// or https://." };

  const { data: client } = await supabase.from("clients").select("id").eq("id", clientId).eq("business_id", business.id).is("archived_at", null).maybeSingle();
  if (!client) return { ok: false, message: "Selected client is not available." };

  const { error: updateError } = await supabase.from("invoices").update({
    client_id: client.id, invoice_number: invoiceNumber, amount, currency, issue_date: issueDate, due_date: dueDate,
    payment_url: paymentUrl || null, notes: notes || null,
  }).eq("id", invoiceId).eq("business_id", business.id);
  if (updateError) {
    if (updateError.code === "23505") return { ok: false, message: "Invoice number already exists in this business." };
    return { ok: false, message: "We could not save this invoice." };
  }
  revalidatePath("/dashboard"); revalidatePath("/dashboard/invoices"); revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true, message: "Invoice saved.", id: invoiceId };
}

export async function markInvoicePaid(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  return setInvoicePaidState(formData, true);
}

export async function markInvoiceUnpaid(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  const { supabase, business, error } = await getBusinessOrError();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };
  const invoiceId = clean(formData.get("invoice_id"));
  const { data: invoice } = await supabase.from("invoices").select("status,due_date").eq("id", invoiceId).eq("business_id", business.id).maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice record not found." };
  if (invoice.status !== "paid") return { ok: false, message: "This invoice is not marked paid." };
  const today = new Date().toISOString().slice(0, 10);
  const nextStatus = invoice.due_date < today ? "overdue" : invoice.due_date === today ? "due" : "scheduled";
  const { error: updateError } = await supabase.from("invoices").update({ status: nextStatus, paid_at: null }).eq("id", invoiceId).eq("business_id", business.id);
  if (updateError) return { ok: false, message: "We could not mark this invoice unpaid." };
  revalidatePath("/dashboard"); revalidatePath("/dashboard/invoices"); revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true, message: "Invoice marked unpaid.", id: invoiceId };
}

async function setInvoicePaidState(formData: FormData, paid: boolean): Promise<InvoiceActionState> {
  const { supabase, business, error } = await getBusinessOrError();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };
  const invoiceId = clean(formData.get("invoice_id"));
  if (!invoiceId) return { ok: false, message: "Invoice record not found." };
  const { data: invoice } = await supabase.from("invoices").select("status").eq("id", invoiceId).eq("business_id", business.id).maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice record not found." };
  if (invoice.status === "cancelled") return { ok: false, message: "A cancelled invoice cannot be marked paid." };
  if (invoice.status === "paid") return { ok: true, message: "Invoice is already paid.", id: invoiceId };
  const { error: updateError } = await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString(), cancelled_at: null }).eq("id", invoiceId).eq("business_id", business.id);
  if (updateError) return { ok: false, message: "We could not mark this invoice paid." };
  revalidatePath("/dashboard"); revalidatePath("/dashboard/invoices"); revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true, message: paid ? "Invoice marked paid." : "Invoice updated.", id: invoiceId };
}

export async function cancelInvoice(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  const { supabase, business, error } = await getBusinessOrError();
  if (error || !business) return { ok: false, message: error ?? "Business workspace not found." };
  const invoiceId = clean(formData.get("invoice_id"));
  const { data: invoice } = await supabase.from("invoices").select("status").eq("id", invoiceId).eq("business_id", business.id).maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice record not found." };
  if (invoice.status === "paid") return { ok: false, message: "A paid invoice cannot be cancelled." };
  if (invoice.status === "cancelled") return { ok: true, message: "Invoice is already cancelled.", id: invoiceId };
  const { error: updateError } = await supabase.from("invoices").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", invoiceId).eq("business_id", business.id);
  if (updateError) return { ok: false, message: "We could not cancel this invoice." };
  revalidatePath("/dashboard"); revalidatePath("/dashboard/invoices"); revalidatePath(`/dashboard/invoices/${invoiceId}`);
  return { ok: true, message: "Invoice cancelled.", id: invoiceId };
}
