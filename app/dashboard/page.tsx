import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business/current";
import { Button } from "@/components/ui/Button";
export const dynamic = "force-dynamic";
function money(amount: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount); } catch { return `${currency} ${amount.toFixed(2)}`; } }
export default async function Dashboard(){
 const { business, supabase } = await getCurrentBusiness();
 if(!business) return <div className="mx-auto max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Workspace</p><h1 className="mt-2 text-3xl font-bold">Welcome to Invoice Chaser</h1><p className="mt-2 text-[#52636B]">Your account is ready. Create your business workspace to start managing clients and invoices.</p><Card className="mt-8 p-6 sm:p-8"><h2 className="text-xl font-bold">Create your workspace</h2><p className="mt-2 text-[#52636B]">You can change these details later in Business settings.</p><div className="mt-6"><Button href="/dashboard/onboarding">Set up business</Button></div></Card></div>;
 const { data: invoices } = await supabase.from("invoices").select("amount,currency,status").eq("business_id", business.id);
 const rows = invoices ?? [];
 const sum = (statuses: string[]) => rows.filter(i=>statuses.includes(i.status)).reduce((a,i)=>a+Number(i.amount),0);
 const outstanding = sum(["draft","scheduled","due","overdue"]);
 const dueSoon = sum(["due"]);
 const overdue = sum(["overdue"]);
 const paid = sum(["paid"]);
 return <div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Workspace</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">{business.name}</h1><p className="mt-2 text-[#52636B]">Your invoice activity at a glance.</p></div><Button href="/dashboard/invoices/new">Create invoice</Button></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Outstanding", outstanding],["Due", dueSoon],["Overdue", overdue],["Paid", paid]].map(([t,v])=><Card key={String(t)} className="p-5"><p className="text-sm text-[#52636B]">{t}</p><p className="mt-3 text-2xl font-bold">{money(Number(v), business.default_currency)}</p><p className="mt-1 text-xs text-[#52636B]">Across {rows.length} invoice{rows.length===1?"":"s"}</p></Card>)}</div><Card className="mt-6 p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-bold">Invoice workspace</h2><Link className="text-sm font-semibold text-[#087F78]" href="/dashboard/invoices">View invoices</Link></div><p className="mt-2 text-sm text-[#52636B]">Create invoices now. Reminder scheduling and automated email follow-ups arrive in later checkpoints.</p></Card></div>
}
