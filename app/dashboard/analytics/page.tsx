import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCurrentBusiness } from "@/lib/business/current";
import { getBusinessSubscription } from "@/features/billing/subscription";
import { canUseAnalytics } from "@/features/billing/entitlements";

export const dynamic = "force-dynamic";

function money(amount: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); }
  catch { return `${currency} ${amount.toFixed(2)}`; }
}

export default async function AnalyticsPage() {
  const { business, supabase } = await getCurrentBusiness();
  if (!business) return <Card className="p-8"><h1 className="text-2xl font-bold">Create your business first</h1><p className="mt-2 text-sm text-[#52636B]">Analytics become available after workspace setup.</p><div className="mt-5"><Button href="/dashboard/onboarding">Set up business</Button></div></Card>;
  const { planId } = await getBusinessSubscription(supabase, business.id);
  if (!canUseAnalytics(planId)) return <Card className="p-8"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Analytics</p><h1 className="mt-2 text-3xl font-bold">See payment performance</h1><p className="mt-3 max-w-2xl text-[#52636B]">Basic analytics are included from the Pro plan onward. Upgrade to inspect payment status and reminder activity in one place.</p><div className="mt-6"><Button href="/pricing">View plans</Button></div></Card>;

  const [{ data: invoices }, { data: logs }] = await Promise.all([
    supabase.from("invoices").select("amount,currency,status,due_date,paid_at").eq("business_id", business.id),
    supabase.from("email_logs").select("status").eq("business_id", business.id),
  ]);
  const rows = invoices ?? [];
  const total = rows.length;
  const paid = rows.filter((r) => r.status === "paid");
  const overdue = rows.filter((r) => r.status === "overdue");
  const outstanding = rows.filter((r) => ["draft", "scheduled", "due", "overdue"].includes(r.status));
  const paidAmount = paid.reduce((sum, row) => sum + Number(row.amount), 0);
  const outstandingAmount = outstanding.reduce((sum, row) => sum + Number(row.amount), 0);
  const overdueAmount = overdue.reduce((sum, row) => sum + Number(row.amount), 0);
  const emailsSent = (logs ?? []).filter((row) => row.status === "sent" || row.status === "delivered").length;
  const paymentRate = total ? Math.round((paid.length / total) * 100) : 0;

  return <div className="space-y-6"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Analytics</p><h1 className="mt-2 text-3xl font-bold">Payment performance</h1><p className="mt-2 max-w-2xl text-[#52636B]">A practical overview of invoices, collections and reminder activity.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Paid", money(paidAmount, business.default_currency)], ["Outstanding", money(outstandingAmount, business.default_currency)], ["Overdue", money(overdueAmount, business.default_currency)], ["Paid rate", `${paymentRate}%`]].map(([label,value]) => <Card key={label} className="p-5"><p className="text-sm text-[#52636B]">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p></Card>)}</div>
    <div className="grid gap-5 lg:grid-cols-2"><Card className="p-6"><h2 className="text-xl font-bold">Invoice activity</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Total invoices</span><strong>{total}</strong></div><div className="flex justify-between"><span>Paid invoices</span><strong>{paid.length}</strong></div><div className="flex justify-between"><span>Overdue invoices</span><strong>{overdue.length}</strong></div><div className="flex justify-between"><span>Outstanding invoices</span><strong>{outstanding.length}</strong></div></div></Card><Card className="p-6"><h2 className="text-xl font-bold">Reminder activity</h2><p className="mt-2 text-sm text-[#52636B]">Successful reminder emails recorded for this workspace.</p><p className="mt-6 text-3xl font-bold">{emailsSent}</p><p className="mt-1 text-xs text-[#52636B]">sent or delivered email events</p></Card></div>
  </div>;
}
