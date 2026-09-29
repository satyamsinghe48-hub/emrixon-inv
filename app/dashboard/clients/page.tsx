import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCurrentBusiness } from "@/lib/business/current";
export const dynamic = "force-dynamic";
export default async function Page(){
 const { business, supabase } = await getCurrentBusiness();
 if(!business) return <Card className="p-8"><h1 className="text-2xl font-bold">Create your business first</h1><p className="mt-2 text-[#52636B]">Your client workspace will be available after setup.</p><div className="mt-6"><Button href="/dashboard/onboarding">Set up business</Button></div></Card>;
 const { data: clients } = await supabase.from("clients").select("id, company_name, contact_name, email, phone, updated_at").eq("business_id", business.id).is("archived_at", null).order("updated_at", {ascending:false});
 return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Workspace</p><h1 className="mt-2 text-3xl font-bold">Clients</h1><p className="mt-2 text-[#52636B]">Keep client contact details ready for invoice reminders.</p></div><Button href="/dashboard/clients/new">Add client</Button></div><Card className="mt-8 overflow-hidden p-0"><div className="divide-y divide-[#e5efed]">{clients?.length ? clients.map((client)=><Link href={`/dashboard/clients/${client.id}`} key={client.id} className="block p-5 hover:bg-[#f7fbfa]"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">{client.company_name || client.contact_name}</p><p className="mt-1 text-sm text-[#52636B]">{client.contact_name && client.company_name ? client.contact_name+" · ":""}{client.email}</p></div><span className="text-sm text-[#087F78]">Open →</span></div></Link>) : <div className="p-8"><h2 className="font-bold">No clients yet</h2><p className="mt-2 text-sm text-[#52636B]">Add your first client to prepare for invoice reminders.</p><div className="mt-5"><Button href="/dashboard/clients/new">Add first client</Button></div></div>}</div></Card></div>;
}
