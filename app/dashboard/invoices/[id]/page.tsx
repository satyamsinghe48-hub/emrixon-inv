import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { InvoiceActionForms } from "@/components/invoices/InvoiceActionForms";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { getCurrentBusiness } from "@/lib/business/current";
export const dynamic = "force-dynamic";
function money(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount.toFixed(2)}`; } }
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { business, supabase } = await getCurrentBusiness();
  if (!business) return <Card className="p-8"><h1 className="text-2xl font-bold">Create your business first</h1><div className="mt-6"><Button href="/dashboard/onboarding">Set up business</Button></div></Card>;
  const { id } = await params;
  const { data: invoice } = await supabase.from("invoices").select("*, clients(id, company_name, contact_name, email)").eq("id", id).eq("business_id", business.id).maybeSingle();
  if (!invoice) notFound();
  const { data: clients } = await supabase.from("clients").select("id, company_name, contact_name, email").eq("business_id", business.id).is("archived_at", null).order("company_name", { ascending: true });
  const locked = invoice.status === "paid" || invoice.status === "cancelled";
  return <div className="max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Invoice</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold">{invoice.invoice_number}</h1><InvoiceStatusBadge status={invoice.status}/></div><p className="mt-2 text-[#52636B]">{invoice.clients?.company_name || invoice.clients?.contact_name || invoice.clients?.email}</p></div><Button href="/dashboard/invoices" variant="secondary">Back to invoices</Button></div>
  <Card className="mt-8 p-6 sm:p-8"><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#52636B]">Amount</p><p className="mt-2 text-2xl font-bold">{money(Number(invoice.amount), invoice.currency)}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-[#52636B]">Issue date</p><p className="mt-2 font-semibold">{invoice.issue_date}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-[#52636B]">Due date</p><p className="mt-2 font-semibold">{invoice.due_date}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-[#52636B]">Client email</p><p className="mt-2 break-all font-semibold">{invoice.clients?.email}</p></div></div>{invoice.payment_url && <div className="mt-7 border-t border-[#e5efed] pt-6"><p className="text-sm font-semibold">Payment link</p><a href={invoice.payment_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-semibold text-[#087F78]">{invoice.payment_url}</a></div>}{invoice.notes && <div className="mt-7 border-t border-[#e5efed] pt-6"><p className="text-sm font-semibold">Notes</p><p className="mt-2 whitespace-pre-wrap text-sm text-[#52636B]">{invoice.notes}</p></div>}<div className="mt-7 border-t border-[#e5efed] pt-6"><InvoiceActionForms invoiceId={invoice.id} status={invoice.status}/></div></Card>
  {!locked && <Card className="mt-6 p-6 sm:p-8"><div className="mb-6"><h2 className="text-xl font-bold">Edit invoice</h2><p className="mt-1 text-sm text-[#52636B]">Keep unpaid invoice details accurate before reminders are enabled.</p></div><InvoiceForm businessId={business.id} defaultCurrency={business.default_currency} clients={clients ?? []} invoice={invoice}/></Card>}
  {invoice.status === "paid" && <Card className="mt-6 p-6"><h2 className="font-bold">Payment recorded</h2><p className="mt-2 text-sm text-[#52636B]">Paid at {invoice.paid_at ? new Date(invoice.paid_at).toLocaleString() : "the recorded time"}. Future reminder automation will use this state to stop follow-ups.</p></Card>}
  {invoice.status === "cancelled" && <Card className="mt-6 p-6"><h2 className="font-bold">Invoice cancelled</h2><p className="mt-2 text-sm text-[#52636B]">This invoice is preserved for history and cannot be edited.</p></Card>}
  </div>;
}
