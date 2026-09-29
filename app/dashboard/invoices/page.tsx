import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { getCurrentBusiness } from "@/lib/business/current";
export const dynamic = "force-dynamic";

const filters = ["all", "draft", "scheduled", "due", "overdue", "paid", "cancelled"] as const;
function money(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount.toFixed(2)}`; } }
function displayClient(c: any) { return c?.company_name || c?.contact_name || c?.email || "Unknown client"; }

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { business, supabase } = await getCurrentBusiness();
  if (!business) return <Card className="p-8"><h1 className="text-2xl font-bold">Create your business first</h1><p className="mt-2 text-[#52636B]">Your invoice workspace will be available after setup.</p><div className="mt-6"><Button href="/dashboard/onboarding">Set up business</Button></div></Card>;
  const params = await searchParams;
  const status = filters.includes((params.status ?? "all") as any) ? (params.status ?? "all") : "all";
  const q = (params.q ?? "").trim();
  let query = supabase.from("invoices").select("id, invoice_number, amount, currency, issue_date, due_date, status, client_id, clients(company_name, contact_name, email)").eq("business_id", business.id).order("due_date", { ascending: true });
  if (status !== "all") query = query.eq("status", status);
  const { data: invoices } = await query;
  const filtered = (invoices ?? []).filter((invoice: any) => !q || invoice.invoice_number.toLowerCase().includes(q.toLowerCase()) || displayClient(invoice.clients).toLowerCase().includes(q.toLowerCase()));
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Workspace</p><h1 className="mt-2 text-3xl font-bold">Invoices</h1><p className="mt-2 text-[#52636B]">Create and track invoices without leaving your workspace.</p></div><Button href="/dashboard/invoices/new">Create invoice</Button></div>
    <Card className="mt-8 p-4"><form className="flex flex-col gap-3 sm:flex-row" method="get"><input name="q" defaultValue={q} className="field flex-1" placeholder="Search invoice number or client"/><select name="status" defaultValue={status} className="field sm:max-w-48"><option value="all">All statuses</option>{filters.slice(1).map(f => <option key={f} value={f}>{f[0].toUpperCase()+f.slice(1)}</option>)}</select><Button type="submit" variant="secondary">Filter</Button></form></Card>
    <Card className="mt-5 overflow-hidden p-0"><div className="divide-y divide-[#e5efed]">{filtered.length ? filtered.map((invoice: any) => <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`} className="block p-5 hover:bg-[#f7fbfa]"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><p className="font-semibold">{invoice.invoice_number}</p><InvoiceStatusBadge status={invoice.status}/></div><p className="mt-1 truncate text-sm text-[#52636B]">{displayClient(invoice.clients)}</p></div><div className="text-left sm:text-right"><p className="font-semibold">{money(Number(invoice.amount), invoice.currency)}</p><p className="mt-1 text-xs text-[#52636B]">Due {invoice.due_date}</p></div></div></Link>) : <div className="p-8"><h2 className="font-bold">{q || status !== "all" ? "No matching invoices" : "No invoices yet"}</h2><p className="mt-2 text-sm text-[#52636B]">{q || status !== "all" ? "Try another search or status." : "Create your first invoice to start tracking payments."}</p>{!q && status === "all" && <div className="mt-5"><Button href="/dashboard/invoices/new">Create first invoice</Button></div>}</div>}</div></Card>
  </div>;
}
