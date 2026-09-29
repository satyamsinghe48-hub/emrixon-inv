import { Card } from "@/components/ui/Card";
import { getCurrentBusiness } from "@/lib/business/current";
import { sendReminderNow } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { supabase, business } = await getCurrentBusiness();
  if (!business) return <p>Business workspace not found.</p>;
  const { data: jobs } = await supabase.from("reminder_jobs").select("id,invoice_id,scheduled_for,status,attempt_count,next_retry_at,last_error,dead_lettered_at").eq("business_id", business.id).order("scheduled_for", { ascending: true }).limit(100);
  return <div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Automation</p><h1 className="mt-2 text-3xl font-bold">Reminders</h1><p className="mt-2 text-[#52636B]">The scheduler creates reminder jobs, the email system sends transactional follow-ups, and the worker retries recoverable failures.</p><Card className="mt-6 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#dcebe8] bg-[#f7fbfa]"><tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Scheduled</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{(jobs || []).map((job) => <tr key={job.id} className="border-b border-[#edf4f2]"><td className="px-4 py-3 font-mono text-xs">{job.id.slice(0, 8)}…</td><td className="px-4 py-3 font-mono text-xs">{job.invoice_id.slice(0, 8)}…</td><td className="px-4 py-3">{new Date(job.scheduled_for).toLocaleString()}</td><td className="px-4 py-3 font-semibold">{job.status}</td><td className="px-4 py-3">{job.status === "pending" || job.status === "failed" ? <form action={sendReminderNow}><input type="hidden" name="job_id" value={job.id} /><button className="font-semibold text-[#087F78]" type="submit">Send now</button></form> : <span className="text-[#52636B]">—</span>}</td></tr>)}{(!jobs || jobs.length === 0) && <tr><td colSpan={5} className="px-4 py-12 text-center text-[#52636B]">No reminder jobs yet.</td></tr>}</tbody></table></div></Card></div>;
}
