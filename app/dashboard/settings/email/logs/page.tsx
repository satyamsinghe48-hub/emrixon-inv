import { Card } from "@/components/ui/Card";
import { getCurrentBusiness } from "@/lib/business/current";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return <p>Business workspace not found.</p>;
  const { data: logs } = await supabase.from("email_logs").select("id,recipient,subject,provider,status,provider_message_id,error_message,created_at,sent_at").eq("business_id", business.id).order("created_at", { ascending: false }).limit(100);
  return <div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Email</p><h1 className="mt-2 text-3xl font-bold">Email activity</h1><p className="mt-2 text-[#52636B]">Latest transactional email attempts for this business.</p><Card className="mt-6 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[#dcebe8] bg-[#f7fbfa]"><tr><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Created</th></tr></thead><tbody>{(logs || []).map((log) => <tr key={log.id} className="border-b border-[#edf4f2]"><td className="px-4 py-3">{log.recipient}</td><td className="max-w-sm px-4 py-3">{log.subject}</td><td className="px-4 py-3 font-semibold">{log.status}</td><td className="px-4 py-3">{log.provider}</td><td className="px-4 py-3 text-[#52636B]">{new Date(log.created_at).toLocaleString()}</td></tr>)}{(!logs || logs.length === 0) && <tr><td colSpan={5} className="px-4 py-12 text-center text-[#52636B]">No email activity yet.</td></tr>}</tbody></table></div></Card></div>;
}
