import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AutomationToggle } from "@/components/reminders/ReminderSettingsForm";
import { getCurrentBusiness } from "@/lib/business/current";
import { getBusinessSubscription } from "@/features/billing/subscription";
import { canUseCustomSchedules } from "@/features/billing/entitlements";
import { SYSTEM_EMAIL_TEMPLATES } from "@/features/email/templates/catalog";
import { createReminderRule } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReminderSettingsPage() {
  const { business, supabase } = await getCurrentBusiness();
  if (!business) return <Card className="p-8"><h1 className="text-2xl font-bold">Create your business first</h1><p className="mt-2 text-sm text-[#52636B]">Reminder settings become available after workspace setup.</p><div className="mt-5"><Button href="/dashboard/onboarding">Set up business</Button></div></Card>;

  const [{ data: rules }, { planId }] = await Promise.all([
    supabase.from("reminder_rules").select("id,name,offset_days,offset_type,template_id,active").eq("business_id", business.id).order("created_at", { ascending: true }),
    getBusinessSubscription(supabase, business.id),
  ]);
  const customSchedules = canUseCustomSchedules(planId);

  return <div className="space-y-6">
    <div><p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F78]">Settings</p><h1 className="mt-2 text-3xl font-bold">Reminder automation</h1><p className="mt-2 max-w-2xl text-[#52636B]">Control automatic follow-ups and the schedule used for unpaid invoices.</p></div>
    <Card className="p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Automation</h2><p className="mt-1 text-sm text-[#52636B]">{business.automation_enabled ? "Automatic reminders are enabled." : "Automatic reminders are paused. Pending reminders are kept safely."}</p></div><AutomationToggle enabled={business.automation_enabled} /></div></Card>

    <Card className="p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold">Reminder rules</h2><p className="mt-1 text-sm text-[#52636B]">Times are scheduled for 09:00 in your business timezone: {business.timezone}.</p></div><span className="rounded-full bg-[#E8F7F4] px-3 py-1 text-xs font-semibold text-[#087F78]">{planId}</span></div>
      <div className="mt-6 space-y-3">{(rules ?? []).map((rule) => <div key={rule.id} className="rounded-xl border border-[#dcebe8] p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold">{rule.name}</p><p className="mt-1 text-xs text-[#52636B]">{rule.offset_type.replace("_", " ")} · {rule.offset_days} day(s) · {rule.template_id || "default template"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.active ? "bg-[#E8F7F4] text-[#087F78]" : "bg-slate-100 text-[#52636B]"}`}>{rule.active ? "Active" : "Paused"}</span></div></div>)}</div>
      {!customSchedules && <div className="mt-5 rounded-xl bg-[#f7fbfa] p-4"><p className="text-sm font-semibold">Custom schedule editing starts on Starter.</p><p className="mt-1 text-xs text-[#52636B]">Your default reminder schedule still works on the Free plan.</p><div className="mt-3"><Button href="/pricing" variant="secondary">View plans</Button></div></div>}
    </Card>

    {customSchedules && <Card className="p-6"><h2 className="text-xl font-bold">Add custom rule</h2><p className="mt-1 text-sm text-[#52636B]">Keep custom rules simple and tied to the approved transactional templates.</p><form action={createReminderRule} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><label className="mb-2 block text-sm font-semibold">Name</label><input name="name" required maxLength={100} className="field" placeholder="Final follow-up" /></div><div><label className="mb-2 block text-sm font-semibold">When</label><select name="offset_type" className="field" defaultValue="after_due"><option value="before_due">Before due</option><option value="on_due">On due</option><option value="after_due">After due</option></select></div><div><label className="mb-2 block text-sm font-semibold">Days</label><input name="offset_days" type="number" min="0" max="365" step="1" defaultValue="10" className="field" /></div><div><label className="mb-2 block text-sm font-semibold">Template</label><select name="template_id" className="field" defaultValue="invoice.final_reminder">{Object.entries(SYSTEM_EMAIL_TEMPLATES).map(([key, template]) => <option key={key} value={key}>{template.name}</option>)}</select></div><div className="sm:col-span-2 lg:col-span-4"><Button type="submit">Add rule</Button></div></form></Card>}
  </div>;
}
