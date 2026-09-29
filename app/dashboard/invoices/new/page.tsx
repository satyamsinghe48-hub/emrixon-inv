import { Card } from "@/components/ui/Card";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { getCurrentBusiness } from "@/lib/business/current";
import { Button } from "@/components/ui/Button";
export const dynamic = "force-dynamic";
export default async function Page() {
  const { business, supabase } = await getCurrentBusiness();
  if (!business) return <Card className="p-8"><h1 className="text-2xl font-bold">Create your business first</h1><p className="mt-2 text-[#52636B]">Set up a business before creating invoices.</p><div className="mt-6"><Button href="/dashboard/onboarding">Set up business</Button></div></Card>;
  const { data: clients } = await supabase.from("clients").select("id, company_name, contact_name, email").eq("business_id", business.id).is("archived_at", null).order("company_name", { ascending: true });
  return <div className="max-w-4xl"><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Invoices</p><h1 className="mt-2 text-3xl font-bold">Create invoice</h1><p className="mt-2 text-[#52636B]">Add the invoice details now. Payment collection stays with your payment provider.</p><Card className="mt-8 p-6 sm:p-8">{clients?.length ? <InvoiceForm businessId={business.id} defaultCurrency={business.default_currency} clients={clients} /> : <div><h2 className="text-xl font-bold">Add a client first</h2><p className="mt-2 text-[#52636B]">Invoices are linked to a client so reminders can be sent to the right recipient later.</p><div className="mt-6"><Button href="/dashboard/clients/new">Add client</Button></div></div>}</Card></div>;
}
